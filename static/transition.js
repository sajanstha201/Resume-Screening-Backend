function disable_job_file(){
    jb_file_activate=false;
    document.getElementById('job-description-file').value=''
    document.getElementById('job-file-upload').style.display='none';
    document.getElementById('job-file-upload-text').style.display='flex';
}
// this is for disabling the upload mode and enablign the textarea
function disable_resume_file(){
    resume_file_activate=false;
    document.getElementById('add-resume-button').style.display='block';
    document.getElementById('resume-content-file').value=''
    document.getElementById('resume-file-upload').style.display='none';
    document.getElementById('resume-file-upload-text').style.display='flex';
}
function disable_job_text(){
    jb_file_activate=true;
    document.getElementById('job-description-text').value='';
    document.getElementById('job-file-upload-text').style.display='none';
    document.getElementById('job-file-upload').style.display='flex'
}
// this is for disabling the textarea and enabling the upload mode
function disable_resume_text(){
    resume_file_activate=true;
    document.getElementById('add-resume-button').style.display='none';
    document.getElementById('resume-content-text').value='';
    document.getElementById('resume-file-upload-text').style.display='none';
    document.getElementById('resume-file-upload').style.display='flex'
}
//this is for going to the resume upload area
async function activateResult(){
    return new Promise((resolve,reject)=>{
        var final_resume_list={}
        const dbName = "resume_list";
        const request = indexedDB.open(dbName);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(["resumes"], "readonly"); 
            const objectStore = transaction.objectStore("resumes");
            const request = objectStore.getAll();
            request.onsuccess = (event) => {
                const allItems = event.target.result;
                document.getElementById('result').style.display=(allItems.length==0)?'none':'flex';
                resolve(true)
            }
            request.onerror=(event)=>{
                reject(event.target.error)
            }
        }
        request.onerror = (event) => {
            reject(event.target.error)
            console.error('Error retrieving items:', event.target.error);
        }
    })
}
function go_to_resume(){
    if(section_selected===1){
        get_job_description();
        if(!jb_description_selected){
            return;
        }
        document.getElementById('jb').style.display='none';
        document.getElementById('continue-button').style.display='none'

    }
    else if(section_selected==3){
        document.getElementById('rating').style.display='none';
    }
    section_selected=2;

    document.getElementById('resume').style.display='flex'
    //document.getElementById('previous-button').style.display='block'
    activateResult();

    document.getElementById('uploading').style.display='flex';
    
}
//this is for going to job description area
function go_to_jb(){
    section_selected=1;
    document.getElementById('jb').style.display='flex'
    document.getElementById('resume').style.display='none'
    document.getElementById('continue-button').style.display='block'
   // document.getElementById('previous-button').style.display='none';
    document.getElementById('result').style.display='none'

    document.getElementById('rating').style.display='none';
    document.getElementById('uploading').style.display='flex';
}
function go_to_rating(){
    if(!resumeSelected){
        showAlert('No resume Selected','red')
        return;
    }
    if(section_selected===1){
        get_job_description();
        if(!jb_description_selected){
            return;
        }
        document.getElementById('jb').style.display='none';
    }
    else if(section_selected===2){
        document.getElementById('resume').style.display='none';
        document.getElementById('result').style.display='none';
    }
    document.getElementById('uploading').style.display='none';
    section_selected=3;

    document.getElementById('rating').style.display='flex';

}