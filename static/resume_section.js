
//checks if duplicate pdfname is present in the indexdb or not and returns true if duplicate name is present and false if not
function check_duplicate_pdfname(pdfname){
    return new Promise((resolve,reject)=>{
        const dbName = "resume_list";
        const request = indexedDB.open(dbName);
        request.onsuccess = (event) => {
            const db = event.target.result;
            const transaction = db.transaction(["resumes"], "readonly"); 
            const objectStore = transaction.objectStore("resumes");
            const request = objectStore.getAll();
            request.onsuccess = (event) => {
                const allItems = event.target.result;
                for(let i=0;i<allItems.length;i++){
                        if(pdfname===allItems[i].name){
                                resolve(true)
                            }
                    }
                resolve(false)
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
// this is for uploading the selected file in the table
function uploadResume() {
    document.getElementById('instance-upload-file').style.display='none';
    const fileInput=document.getElementById('resume-content-file')
    const textInput=document.getElementById('resume-content-text')
    const selectedFiles = fileInput.files;
    const dbName = "resume_list";
    const request = indexedDB.open(dbName);
    if(!resume_file_activate){
        if(textInput.value.trim()===""){
            showAlert("Empty Textarea",'red');
            return;
        }
        request.onsuccess=(event)=>{
        const db=event.target.result;
        const transaction=db.transaction(["resumes"],"readwrite");
        const objectStore=transaction.objectStore("resumes")
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0'); 
        const day = String(now.getDate()).padStart(2, '0');
        const hour = String(now.getHours()).padStart(2, '0');
        const minute = String(now.getMinutes()).padStart(2, '0');
        const second = String(now.getSeconds()).padStart(2, '0');
        const formattedDateTime = `${year}-${month}-${day}_${hour}-${minute}-${second}`;
            objectStore.add({name:'Resume No '+formattedDateTime,content:textInput.value})
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
            showAlert("No File Selected",'red')
            return;
        }
        activate_loader(true);
        const dbName = "resume_list";
        const request = indexedDB.open(dbName);
        request.onsuccess = async (event) => {
        const db = event.target.result;
        const fileReadPromises=[]
        for (let i = 0; i < selectedFiles.length; i++) {
            const file=selectedFiles[i]
            const duplicate=await check_duplicate_pdfname(file.name);
            if(!duplicate ){
                var v=0;
                const fileReadPromise=await new Promise((resolve,reject)=>{
                v=i;
                const reader= new FileReader()
                reader.onload=(event)=>{
                    if(file.name.endsWith('.pdf')){
                            const typedArray = new Uint8Array(event.target.result);
                            var pdfData=typedArray
                            pdfjsLib.getDocument(pdfData).promise.then(function(pdf) {
                                let text = '';
                                const promises = [];
                                for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
                                    promises.push(pdf.getPage(pageNumber).then(function(page) {
                                    return page.getTextContent();
                                }));
                                }
                                Promise.all(promises).then(function(textContents) {
                                    textContents.forEach(function(content) {
                                    content.items.forEach(function(item) {
                                        text += item.str + ' ';
                                        });
                                    });
                                    resolve({name: file.name,content:text})
                                });
                            });
                        }
                        else if(file.name.endsWith('.doc')||file.name.endsWith('.docx')){
                            mammoth.extractRawText({arrayBuffer: event.target.result})
                            .then((text)=>{
                                resolve({name: file.name,content:text.value});
                            })
                            .catch(function(err) {
                                activate_loader(false)
                                showAlert('Error During Reading the File','red')          
                            console.log(err);
                            reject(err.target.value)
                            
                            });
                        };
                    }
                    reader.onerror=(event)=>{ 
                        activate_loader(false)
                        showAlert('Error During Reading the File','red')
                        console.error(event.target.error)
                        reject(err.target.value)
                    }
                    reader.readAsArrayBuffer(file);
                })
                fileReadPromises.push(fileReadPromise)
            }
            else{
                const str='Duplicate Document Detected: '+file.name
                showAlert(str,'red')
            }
        }
        try{
            const fileContents=await Promise.all(fileReadPromises)
            const transaction = db.transaction(["resumes"], "readwrite");
            const objectStore = transaction.objectStore("resumes");
            fileContents.forEach(fileData=>{
            objectStore.add(fileData)
            })
            transaction.oncomplete = () => {
            document.getElementById('resume-content-file').value='';
            fileInput.value='';
            showUploadedResume();
            activate_loader(false)
            }
        }
        catch(error){
            activate_loader(false)
            console.log(error);
        } 
        }
        request.onerror=(event)=>{
            activate_loader(false)
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
        list.innerHTML=''
        if(allItems.length==0){
            resumeSelected=false;
        }
        resumeSelected=true;
        for(let i=0;i<allItems.length;i++){   
            id=allItems[i].name
            const Text='<div id="resume-pdf"><p>'+allItems[i].name+'</p></div><div class="resume-cross-buttons" id="'+id+'" onclick="remove_pdf(this)">x</div>'
            //const Text = '<tr><td>' + allItems[i].name + '</td><td><button type="button" id="'+id+'"onclick="remove_pdf(this)"> remove</button></td></tr>';
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
    const main_div = event.closest('div').id
    const pdf_name=main_div;
    const dbName = "resume_list";
    const request = indexedDB.open(dbName);
    console.log(pdf_name)
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
//hi
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
/*
function showSelectedResumeName(input_)
{
    const label=document.getElementById('resume-content-label')
    const div_=document.getElementById('file-upload')
    const files=input_.files;
    const copy_paste=document.getElementById('resume-copy-paste-button')
    label.style.display="none";
    copy_paste.style.display="none";
    var instance_list=document.getElementById('instance-upload-file')
    instance_list.style.display="flex";
    instance_list.innerHTML=""
    if(files.length>3){
        for( let i=0;i<4;i++){
            instance_list.innerHTML+="<div class='pdf-img'><div class='cross-buttons' id='instance-file-cross-button' onclick='delete_instance_file(this)'>x</div><p>"+files[i].name+"</p></div>"
        }
        instance_list.innerHTML+="<div class='pdf-img'><p> . . . </p></div>"
    }
    else{
        for( let i=0;i<files.length;i++){
            instance_list.innerHTML+="<div class='pdf-img'><div class='cross-buttons' id='instance-file-cross-button' onclick='delete_instance_file(this)'>x</div><p>"+files[i].name+"</p></div>"
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
    const label=document.getElementById('resume-content-label');
    const copy_paste=document.getElementById('resume-copy-paste-button')
    const instance_list=document.getElementById('instance-upload-file')
    label.style.display="block"
    copy_paste.style.display="block";
    instance_list.innerHTML=""
}*/
function extractTextFromPDF(pdfData) {
    pdfjsLib.getDocument(pdfData).promise.then(function(pdf) {
      let text = '';
      const promises = [];
      for (let pageNumber = 1; pageNumber <= pdf.numPages; pageNumber++) {
        promises.push(pdf.getPage(pageNumber).then(function(page) {
          return page.getTextContent();
        }));
      }
      Promise.all(promises).then(function(textContents) {
        textContents.forEach(function(content) {
          content.items.forEach(function(item) {
            text += item.str + ' ';
          });
        });
        displayText(text);
      });
    });
  }

//this function is to delete the resume uploaded and displayed on the screen but not added
/*
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
}*/

//this function when called retrives all the resume data stored in indexdb and stores it in the list of objects\dictionary  
async function get_resume_details_from_indexdb(){
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
                for (let i=0;i<allItems.length;i++)
                    {
                        final_resume_list[allItems[i].name]=allItems[i].content
                    }
                resolve(final_resume_list)
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
//this will delete all the resume file that was uploaded 
async function deleteAllResume() {
    const dbName = "resume_list";
    const request = indexedDB.open(dbName);
    request.onsuccess = (event) => {
        const db = event.target.result;
        const transaction = db.transaction(["resumes"], "readwrite");
        const objectStore = transaction.objectStore("resumes");

        objectStore.openCursor().onsuccess = (event) => {
            const cursor = event.target.result;
            if (cursor) {
                const deleteRequest = cursor.delete();
                deleteRequest.onsuccess = () => {
                    console.log(`Deleted record with key ${cursor.primaryKey}`);
                };
                deleteRequest.onerror = (event) => {
                    console.error(`Failed to delete record with key ${cursor.primaryKey}: ${event.target.error}`);
                };
                cursor.continue(); // Move to the next record
            } else {
                // All records have been deleted
                showUploadedResume(); // Update the UI after all deletions are complete
                resumeSelected=false;
            }
        };

        objectStore.openCursor().onerror = (event) => {
            console.error(`Failed to open cursor: ${event.target.error}`);
        };

        transaction.oncomplete = () => {
            console.log("Deleted all resumes");
        };

        transaction.onerror = (event) => {
            console.error(`Transaction failed: ${event.target.error}`);
        };
    };

    request.onerror = (event) => {
        console.error(`Failed to open database: ${event.target.error}`);
    };
}

