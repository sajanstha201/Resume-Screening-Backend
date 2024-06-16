let resume_file_activate=true;
let jb_file_activate=true;
let jb_description_selected=false;
let job_description_details={name:'',content:''}
const dbName = "resume_list";
const dbVersion = 2;
const deleteRequest=indexedDB.deleteDatabase(dbName);
deleteRequest.onsucess=(event)=>{
    console.log('Indexed Cleared');
    }
deleteRequest.onerror=(event)=>{
    console.log('error:',event.target.error);
    }
const request = indexedDB.open(dbName, dbVersion);
request.onerror = (event) => {
    console.error("Error opening IndexedDB:", event.target.error);
}
request.onupgradeneeded = (event) => {
    const db = event.target.result;
    const objectStore = db.createObjectStore("resumes", { autoIncrement: true, keyPath: "id" });
};
// this is for disabling the upload mode and enablign the textarea
function disable_file(button){
    resume_file_activate=false;
    jb_file_activate=false;
    var file_=button.previousElementSibling;
    file_.value=''
    var div_=button.parentElement;
    div_.style.display='none';
    var div_next_sibling=div_.nextElementSibling;
    div_next_sibling.style.display='flex'
}
// this is for disabling the textarea and enabling the upload mode
function disable_text(button){
    resume_file_activate=true;
    jb_file_activate=true;
    var textarea_=button.previousElementSibling;
    textarea_.value=''
    var div_=button.parentElement;
    div_.style.display='none';
    var div_next_sibling=div_.previousElementSibling;
    div_next_sibling.style.display='flex'
}
//this is for going to the resume upload area
function go_to_resume(){
    get_job_description();
    if(!jb_description_selected){
        return;
    }
    if(jb_file_activate){
        display_jb_description_file(true);
    }
    resume_file_activate=true;
    var jb=document.getElementById('jb')
    var resume=document.getElementById('resume')
    var continue_button=document.getElementById('continue-button')
    var previous_button=document.getElementById('previous-button')
    jb.style.display='none'
    resume.style.display='flex'
    continue_button.style.display='none'
    previous_button.style.display='block'
}
//this is for going to job description area
function go_to_jb(){
    var jb=document.getElementById('jb')
    var resume=document.getElementById('resume')
    var continue_button=document.getElementById('continue-button')
    var previous_button=document.getElementById('previous-button')
    jb.style.display='flex'
    resume.style.display='none'
    continue_button.style.display='block'
    previous_button.style.display='none'
}
// this is for uploading the selected file in the table
function uploadResume() {
    const fileInput=document.getElementById('resume-content-file')
    const textInput=document.getElementById('resume-content-text')
    const selectedFiles = fileInput.files;
    const dbName = "resume_list";
    const request = indexedDB.open(dbName);
    if(!resume_file_activate){
        if(textInput.value.trim()===""){
            alert_message("Empty Textarea");
            return;
        }
        request.onsuccess=(event)=>{
        const db=event.target.result;
        const transaction=db.transaction(["resumes"],"readwrite");
        const objectStore=transaction.objectStore("resumes")
        objectStore.add({name:textInput.value.slice(0,20),content:textInput.value})
        transaction.oncomplete=(event)=>{
            console.log("Text resume added to the database");
            showUploadedResume()
            textInput.value=''
        }
        }
        request.onerror=(event)=>{
        console.error(event.target.error)
        }
    }
    else{
        if(selectedFiles.length===0){
            alert_message("No File Selected")
            return;
        }
        const dbName = "resume_list";
        const request = indexedDB.open(dbName);
        request.onsuccess = async (event) => {
        const db = event.target.result;
        const fileReadPromises=[]
        for (let i = 0; i < selectedFiles.length; i++) {
            const file=selectedFiles[i]
            var v=0;
            const fileReadPromise=await new Promise((resolve,reject)=>{
                v=i;
                const reader= new FileReader()
                reader.onload=(event)=>{
                resolve({name: file.name,content:event.target.result})
                }
                reader.onerror=(event)=>{
                reject(event.target.error)
                }
                reader.readAsText(file)
            })
            fileReadPromises.push(fileReadPromise)
        }
        try{
            const fileContents=await Promise.all(fileReadPromises)
            const transaction = db.transaction(["resumes"], "readwrite");
            const objectStore = transaction.objectStore("resumes");
            fileContents.forEach(fileData=>{
            objectStore.add(fileData)
            })
            transaction.oncomplete = () => {
            console.log("Files stored in IndexedDB successfully!");
            showUploadedResume();
            fileInput.value=''
            resume_upload_normal_form();
            }
        }
        catch(error){
            console.log(error);
        } 
        }
        request.onerror=(event)=>{
            console.error(event.target.error);
        }
    }
    }
//this is for showing all the uploaded file in the table form after adding
function showUploadedResume() {
const dbName = "resume_list";
const request = indexedDB.open(dbName);
request.onsuccess = (event) => {
    const db = event.target.result;
    const transaction = db.transaction(["resumes"], "readonly"); 
    const objectStore = transaction.objectStore("resumes");
    const request = objectStore.getAll();
    request.onsuccess = (event) => {
        const allItems = event.target.result;
        const list=document.getElementById('resume-list-div');
        list.innerHTML='<tr><th>Selected Files</th><th>action</th></tr>';
        for(let i=0;i<allItems.length;i++)
        {   
            id="btn_"+i
            const Text = '<tr><td>' + allItems[i].name + '</td><td><button type="button" id="'+id+'"onclick="remove_pdf(this)"> remove</button></td></tr>';
            list.innerHTML=list.innerHTML+Text;
        }
    }
    request.onerror = (event) => {
    console.error('Error retrieving items:', event.target.error);
    }
}
}
function remove_pdf(event)
{
    let primary_key
    const row=event.closest('tr')
    const cells = row.getElementsByTagName('td');
    const pdf_name=cells[0].textContent
    const dbName = "resume_list";
    const request = indexedDB.open(dbName);
    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["resumes"], "readwrite"); 
        const objectStore = transaction.objectStore("resumes");
        objectStore.openCursor().onsuccess=(event)=>{
            const cursor=event.target.result
            if(cursor)
            {
                if(cursor.value.name===pdf_name)
                {
                    const cursor_request=cursor.delete();
                    cursor_request.onsuccess=()=>{
                        showUploadedResume();
                    }

                }
                else{
                    cursor.continue();
                }
            }
        }
        transaction.oncomplete=()=>{
            console.log("delete transaction complete")
        }    
    }
    
    
}
//this is for showing the selected files in the screen before adding it to the table
function showSelectedResumeName(input_)
{
    const label=document.getElementById('resume-content-label')
    const div_=document.getElementById('file-upload')
    const files=input_.files;
    const copy_paste=document.getElementById('resume-copy-paste-button')
    label.style.display="none";
    copy_paste.style.display="none";
    const instance_list=document.getElementById('instance-upload-file')
    instance_list.innerHTML=""
    if(files.length>4){
        for( let i=0;i<5;i++){
            instance_list.innerHTML+="<div class='pdf-img'><div class='cross-buttons' id='instance-file-cross-button' class='instance-file-cross-buttons' onclick='delete_instance_file(this)'>x</div><p>"+files[i].name+"</p></div>"
        }
        instance_list.innerHTML+="<div class='pdf-img'><p> . . . </p></div>"
    }
    else{
        for( let i=0;i<files.length;i++){
            instance_list.innerHTML+="<div class='pdf-img'><div class='cross-buttons' id='instance-file-cross-button' class='instance-file-cross-buttons' onclick='delete_instance_file(this)'>x</div><p>"+files[i].name+"</p></div>"
        }
        if(files.length===0){
            label.style.display="block";
            copy_paste.style.display="block";
        }
    }
}
//this is to convert the resume upload form to normal mode after addding the files that
// is added by the used in the table
function resume_upload_normal_form(){
    const label=document.getElementById('resume-content-label')
    const files=document.getElementById('resume-content-file')
    const copy_paste=document.getElementById('resume-copy-paste-button')
    const instance_list=document.getElementById('instance-upload-file')
    files.value=''
    label.style.display="block"
    copy_paste.style.display="block";
    instance_list.innerHTML=""
}

function get_job_description()
{
    const job_desc_pdf=document.getElementById('job-description-file')
    const job_desc_text=document.getElementById('job-description-text')
    const job_description_files=job_desc_pdf.files
    if(jb_file_activate)
    {
        if(job_description_files.length===0){
            jb_description_selected=false;
            alert_message("No file selected")
            return;
        }
        jb_description_selected=true;
        const reader = new FileReader()
        reader.onload=(event)=>{
            const file_content=event.target.result
            job_description_details={name:job_description_files[0].name,content:file_content}
        }
        reader.onerror=(event)=>{
            console.error(event.target.error)
        }
        reader.readAsText(job_description_files[0])
    }
    else{
        if(job_desc_text.value.trim()===""){
            jb_description_selected=false;
            alert_message("Empty Textarea")
            return;
        }
        jb_description_selected=true;
        job_description_details={name:job_desc_text.value.slice(0,20),content:job_desc_text.value}
    }
}
//this function is to delete the resume uploaded and displayed on the screen but not added
function delete_instance_file(div_){
    var pElement=div_.nextElementSibling;
    var instance_file=document.getElementById('instance-upload-file')
    var fileInput=document.getElementById('resume-content-file')
    const files = Array.from(fileInput.files);
    const namesToRemove = [pElement.textContent];
    const filteredFiles = files.filter(file => !namesToRemove.includes(file.name));
    const dataTransfer = new DataTransfer();
    filteredFiles.forEach(file => dataTransfer.items.add(file));
    fileInput.files = dataTransfer.files;
    console.log(fileInput.files)
    showSelectedResumeName(fileInput)
}

function display_jb_description_file(display_folder){
    var div_=document.getElementById('instance-job-description');
    var label_=document.getElementById('job-description-label');
    var input_=document.getElementById('job-description-file');
    var button_=document.getElementById('jb-copy-paste-button');
    var file_upload=document.getElementById('file-upload')
    if(display_folder){
        div_.style.display='flex';
        label_.style.display='none';
        button_.style.display='none';
        inputFile=input_.files[0];
        div_.innerHTML="<div class='cross-buttons' id='instance-jb-cross-button' onclick='display_jb_description_file(false)'>x</div>"+inputFile.name;
        file_upload.style.background='red';
    }
    else{
        div_.style.display='none';
        label_.style.display='block';
        button_.style.display='block';
        const files=Array.from(input_.files)
        const namesToRemove=input_.files[0].name
        const filteredFiles=files.filter(file=>!namesToRemove.includes(file.name));
        const dataTransfer=new DataTransfer();
        filteredFiles.forEach(file=>dataTransfer.items.add(file))
        input_.files=dataTransfer.files;
        jb_description_selected=false;
    }
}
//this will remove the alert box when cross button is clicked
function remove_alert_box(){
    blur_div=document.getElementById('blur-box');
    alert_div=document.getElementById('alert-box');
    blur_div.style.display='none';
    alert_div.style.display='none';
    alert_div.style.opacity=0;
}
//this is popout the alert message when some alert need to popout in window
function alert_message(message){
    var alert_div=document.getElementById('alert-box')
    var blur_div=document.getElementById('blur-box');
    alert_div.classList.toggle('alert-class')
    alert_div.style.opacity=1;
    blur_div.style.display='flex';
    alert_div.style.display='flex';
    var pElement=alert_div.querySelector('p');
    pElement.textContent=message;
}