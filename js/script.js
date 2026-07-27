let chartInstance = null;

// Load data when page opens
document.addEventListener("DOMContentLoaded", () => {
    loadIncidents();
});

// Submit Incident
document.getElementById("incidentForm").addEventListener("submit", async (e) => {
    e.preventDefault();

    const payload = {
        title: document.getElementById("title").value,
        category: document.getElementById("category").value,
        priority: document.getElementById("priority").value,
        description: document.getElementById("description").value
    };

    await fetch("/api/incidents", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(payload)
    });

    document.getElementById("incidentForm").reset();

    loadIncidents();
});

// Load incidents
async function loadIncidents() {

    const response = await fetch("/api/incidents");
    const data = await response.json();

    const tbody = document.getElementById("incidentTableBody");
    tbody.innerHTML = "";

    let total = 0;
    let high = 0;
    let open = 0;
    let resolved = 0;

    data.incidents.forEach(item => {

        total++;

        if(item.priority === "High") high++;
        if(item.status === "Open") open++;
        if(item.status === "Resolved") resolved++;

        tbody.innerHTML += `
        <tr>

            <td>${item.id}</td>

            <td>
                <strong>${item.title}</strong><br>
                <small class="text-muted">${item.description || ""}</small>
            </td>

            <td>
                <span class="badge bg-secondary">${item.category}</span>
            </td>

            <td>
                <span class="badge ${
                    item.priority=="High"
                    ? "bg-danger"
                    : item.priority=="Medium"
                    ? "bg-warning text-dark"
                    : "bg-info"
                }">
                ${item.priority}
                </span>
            </td>

            <td>
                <span class="badge ${
                    item.status=="Resolved"
                    ? "bg-success"
                    : "bg-primary"
                }">
                ${item.status}
                </span>
            </td>

            <td>

            ${
                item.status=="Open"

                ?

                `<button class="btn btn-sm btn-success"
                onclick="updateStatus(${item.id},'Resolved')">

                Resolve

                </button>`

                :

                `<button class="btn btn-sm btn-secondary"
                onclick="updateStatus(${item.id},'Open')">

                Reopen

                </button>`
            }

            </td>

        </tr>
        `;
    });

    // Dashboard Cards

    document.getElementById("totalIncidents").innerText = total;
    document.getElementById("highPriority").innerText = high;
    document.getElementById("openCases").innerText = open;
    document.getElementById("resolvedCases").innerText = resolved;

    renderChart(data.catData);
}

// Update Status

async function updateStatus(id,status){

    await fetch("/api/incidents/update",{

        method:"POST",

        headers:{
            "Content-Type":"application/json"
        },

        body:JSON.stringify({
            id:id,
            status:status
        })

    });

    loadIncidents();

}

// Chart

function renderChart(catData){

    const ctx=document.getElementById("trendChart").getContext("2d");

    if(chartInstance){
        chartInstance.destroy();
    }

    chartInstance=new Chart(ctx,{

        type:"bar",

        data:{

            labels:Object.keys(catData),

            datasets:[{

                label:"Incidents",

                data:Object.values(catData)

            }]

        },

        options:{

            responsive:true,

            plugins:{
                legend:{
                    display:false
                }
            },

            scales:{
                y:{
                    beginAtZero:true,
                    ticks:{
                        stepSize:1
                    }
                }
            }

        }

    });

}