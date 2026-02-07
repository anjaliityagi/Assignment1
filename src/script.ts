window.addEventListener("DOMContentLoaded", () => { 
    
    alert("JS LOADED");
    const addBtn=document.getElementById("addDocBtn") as HTMLButtonElement;
const modal=document.getElementById("modalOverlay") as  HTMLDivElement;
const cancelBtn=document.getElementById("cancelBtn") as HTMLButtonElement;
const docName=document.getElementById("docName") as HTMLInputElement;
const docStatus=document.getElementById("docStatus") as HTMLInputElement;
const docDateTime=document.getElementById("docDateTime") as HTMLInputElement;
const logoutBtn=document.getElementById("logout-btn") as HTMLButtonElement;
const logoutIcon=document.getElementById("logout-icon") as HTMLElement;
const docTableBody=document.getElementById("docTableBody")as HTMLTableSectionElement;
let editIndex:null|number=null;

interface DocumentItem{
    name:string;
    dateTime:string;
    status:"Pending"|"Needs Signing"|"Completed";
    waitingCount?:number | undefined;
}

logoutIcon.addEventListener("click",(e)=>{
    if(logoutBtn.style.display==="flex") {
        logoutBtn.style.display="none";
    } else {
        logoutBtn.style.display="flex";
    }
});
 
window.addEventListener("click", (e) => {
    if (e.target as Node !== logoutIcon && !logoutBtn.contains(e.target as Node)) {
        logoutBtn.style.display = "none";
    }
});

logoutBtn.addEventListener("click", () => {
    window.alert("Logged out successfully!");
});



addBtn.addEventListener("click", () => {
    modal.style.display = "flex";
});

cancelBtn.addEventListener("click", () => {
    modal.style.display = "none";
      editIndex = null;
});


modal.addEventListener("click", (e) => {
    if (e.target === modal) {
        modal.style.display = "none";
    }
});


function getDocuments():DocumentItem[] {
    return JSON.parse(localStorage.getItem("documents") || "[]");
}

function saveDocuments(docs:DocumentItem[] ):void {
    localStorage.setItem("documents", JSON.stringify(docs));
}


function formatDateTime(dateTime:string) {
    const dateObj = new Date(dateTime);
    const date = dateObj.toLocaleDateString();
    const time = dateObj.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    return { date,time };
}

const waitingWrapper = document.getElementById("waitingWrapper") as HTMLDivElement;
const waitingCountInput = document.getElementById("waitingCount") as HTMLInputElement;
docStatus.addEventListener("change", () => {
    if (docStatus.value === "Pending") {
        waitingWrapper.style.display = "block";
    } else {
        waitingWrapper.style.display = "none";
        waitingCountInput.value = "";
    }
});

function addRowToTable(doc:DocumentItem, index:number):void {
    const row = document.createElement("tr") as HTMLTableRowElement;
    row.dataset.index = index.toString();

    let actionText = "";
    let statusClass = "";

    if (doc.status === "Needs Signing") {
        actionText = "Sign now";
        statusClass = "pill-dark";
    } else if (doc.status === "Pending") {
        actionText = "Preview";
        statusClass = "pill-gray";
    } else {
        actionText = "Download PDF";
        statusClass = "pill-green";
    }

    const {date,time} = formatDateTime(doc.dateTime);
  let waitingText = "";

if (doc.status === "Pending" && doc.waitingCount) {
    waitingText = `<i ><div class="waiting-text"><span class="muted">Waiting for </span>${doc.waitingCount} people</div></i>`;
}
    row.innerHTML = `
        <td><input type="checkbox"></td>
        <td class="doc-title">${doc.name}</td>
        <td><span class="pill ${statusClass}">${doc.status}</span>${waitingText}</td>
        <td class="time">
            ${date}<br>
            <span >${time}</span>
        </td>
        <td class="cell-actions">
            <button class="action-btn">${actionText}</button>
            <div class="menu-wrapper">
                <i class="fas fa-ellipsis-v dots"></i>
                <div class="menu">
                    <div class="menu-item edit">Edit</div>
                    <div class="menu-item delete">Delete</div>
                </div>
            </div>
        </td>
    `;
    docTableBody.appendChild(row);
}

const saveBtn = document.getElementById("saveBtn") as HTMLButtonElement;

saveBtn.addEventListener("click", () => {
    const name = docName.value.trim();
    const status= docStatus.value as "Pending"|"Needs Signing"|"Completed"  ;
    const dateTime = docDateTime.value;
   let waitingCount:number |undefined;
    if (!name||!status||!dateTime) {
        alert("Fill all fields");
        return;
    }
   
  if (status==="Pending") {
        waitingCount=Number(waitingCountInput.value);
          
    if (isNaN(waitingCount) || waitingCount<1) {
        alert("Waiting count must be at least 1");
        
    }
        if (!waitingCount) {
            alert("Enter number of people waiting!");
           
        }
    }
    const documents = getDocuments();

    if (editIndex !== null) {
        documents[editIndex] = { name,status,dateTime,waitingCount };
        saveDocuments(documents);
        refreshTable();

     

    } else {
        const newDoc = { name, status, dateTime,  waitingCount };
        documents.push(newDoc);
        saveDocuments(documents);
        addRowToTable(newDoc, documents.length - 1);
    }

    editIndex = null;
    modal.style.display = "none";
    docName.value = "";
 docStatus.value = "Needs Signing";
    docDateTime.value = "";
    waitingCountInput.value = "";
    waitingWrapper.style.display = "none";
});




document.addEventListener("click", (e:MouseEvent) => {
     const target = e.target as HTMLElement;
     
     if (target.classList.contains("dots")) {
        const menu = target.nextElementSibling as HTMLDivElement;
        menu.style.display = menu.style.display === "block" ? "none" : "block";
    } else {
        document.querySelectorAll(".menu").forEach(m =>(m as HTMLDivElement).style.display = "none");
    }
});

document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("delete")) {
        const row = target.closest("tr") as HTMLTableRowElement;
        const index =Number( row.dataset.index);
        const documents = getDocuments();
        documents.splice(index, 1);
        saveDocuments(documents);
       refreshTable();
    }
});


function refreshTable(){
    docTableBody.innerHTML = "";
    const documents = getDocuments();
    documents.forEach((doc, index) => addRowToTable(doc, index));
}

document.addEventListener("click", (e) => {
    const target = e.target as HTMLElement;
    if (target.classList.contains("edit")) {
        
        const row = target.closest("tr") as HTMLTableRowElement;
        editIndex = Number(row.dataset.index);
        const documents = getDocuments();
        const doc = documents[editIndex!]!;

        docName.value = doc.name;
        docStatus.value = doc.status;
        docDateTime.value = doc.dateTime;

    
         if (doc.status === "Pending") {
            waitingWrapper.style.display = "block";
            waitingCountInput.value = (doc.waitingCount || "").toString();
         
        } else {
            waitingWrapper.style.display = "none";
            waitingCountInput.value = "";
        }
const waitingCount = Number(waitingCountInput.value);

        modal.style.display = "flex";
    }
});

const searchInput = document.getElementById("searchInput")as HTMLInputElement;

searchInput.addEventListener("input", () => {
  const searchValue = searchInput.value.toLowerCase();
  const rows = document.querySelectorAll<HTMLTableRowElement>("#docTableBody tr");

  rows.forEach(row => {
    const docName = row.querySelector(".doc-title")!.textContent.toLowerCase();

    if (docName.includes(searchValue)) {
      row.style.display = "";
    } else {
      row.style.display = "none";
    }
  });
}); 

refreshTable();


   
});




