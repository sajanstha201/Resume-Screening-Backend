pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.11.338/pdf.worker.min.js';
let resume_file_activate=true;
let jb_file_activate=false;
let jb_description_selected=false;
let job_description_details={name:'',content:''}
let section_selected=1;
let resumeSelected=false;
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

