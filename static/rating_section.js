function display_rating_score(score){
    var table_body=document.getElementById('table-body');
    table_body.innerHTML=""
    for (const key in score){
        var checked_star='';
        var unchecked_star='';
        for(i=0;i<score[key];i++){
            checked_star+='<span class="fa fa-star checked"></span>'
        }
        for(i=0;i<10-score[key];i++){
            unchecked_star+='<span class="fa fa-star"></span>'
        }
        table_body.innerHTML+='<tr><td>'+key+'<td>'+score[key]+'</td><td>'+checked_star+unchecked_star+'</td></td></tr>'
    }
}
async function submitResume(){
    get_job_description();
    if(!jb_description_selected){
            return;
    }
    if(!resumeSelected){
        showAlert('No resume Selected','red')
        return;
    }
    document.getElementById('loader-box').style.display='flex';
    var rating_score=await request_posting()
    document.getElementById('loader-box').style.display='none';
    display_rating_score(rating_score);
    document.getElementById('rating').style.display='flex';
 }
async function request_token(){
    let token
    await fetch('http://127.0.0.1:8000/get-token/',{
        method:'GET'
    }).then(response=>{
        return response.json()
    }).then(data=>{
        token=data
    }).catch(error=>{
        console.log(error)
    })
    console.log(token)
    return token.token
}
 async function request_posting(){
    return new Promise(async (resolve,reject)=>{
        const csrfToken = await request_token();
        var resume_data=await get_resume_details_from_indexdb();
        console.log(resume_data)
        await fetch('http://127.0.0.1:8000/get-rating/?format=json',{
            method:'POST',
            headers: {
                'Content-Type': 'application/json',
                'X-CSRFToken': csrfToken
            },
            body:JSON.stringify({job_description:job_description_details.content,
                resume_detail:resume_data})
            }).then((response)=>{
                if(response.ok){
                    return response.json(resume_data)
                }
                showAlert('GOT SOME ERROR!!','red')
                document.getElementById('loader-box').style.display='none';
                reject('error detected')
            }).then((data)=>{
                resolve(data);
            }).catch(error=>{
                showAlert('GOT SOME ERROR!!: ','red')
                document.getElementById('loader-box').style.display='none';
                reject(error.target.value)
            })
    })
}
async function download_pdf(){
    activate_loader(true);
    const csrfToken = await request_token();
    var resume_data=await get_resume_details_from_indexdb();
    await fetch('http://127.0.0.1:8000/get-rating/?format=csv',{
        method:'POST',
        headers: {
            'Content-Type': 'application/json',
            'X-CSRFToken': csrfToken
        },
        body:JSON.stringify({job_description:job_description_details.content,
            resume_detail:resume_data})
        })
        .then((response)=>{
            return response.blob()
        })
        .then((data)=>{
            const url=window.URL.createObjectURL(data)
            const a=document.createElement('a')
            a.style.display='none';
            a.href=url;
            a.download='rating score.csv'
            document.body.appendChild(a)
            a.click();
            window.URL.revokeObjectURL(url)
        })
        .catch((error)=>{
            showAlert('Error: '+error.target.value,'red')
            reject(error.target.value)
        })
    activate_loader(false);
}