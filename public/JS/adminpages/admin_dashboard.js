document.addEventListener('DOMContentLoaded', async () => {
    const tableContainer = document.getElementById('tableContainer');
    const tableHeading = document.getElementById('tableHeading');
    const dashboardCards = document.getElementById('dashboardCards');

    const menuItems = {
        'Buyer Data': 'BUYER_DATA',
        'Seller Data': 'SELLER_DATA',
        'Crops Data': 'CROP_DATA'
    };

    const tableHeaders = {
        BUYER_DATA: ['NAME', 'BUYER_EMAIL', 'PHONE_NO', 'ADDRESS','CITY' ],
        SELLER_DATA: ['NAME', 'SELLER_EMAIL', 'PHONE_NO', 'SELLER_ADDRESS','CITY'],
        CROP_DATA: ['CROPID', 'NAME', 'CATEGORY', 'PRICE' , 'QUANTITY', 'SELLER_EMAIL']
    };


    function generateTable(tableData, headers) {
        tableContainer.innerHTML = ''; // Clear previous table
        tableHeading.textContent = '';
        dashboardCards.innerHTML = '';

        const table = document.createElement('table');

        // Create table header
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headers.forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
        thead.appendChild(headerRow);
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        tableData.forEach(rowData => {
            const row = document.createElement('tr');
            headers.forEach(header => {
                const cell = document.createElement('td');
                cell.textContent = rowData[header];
                row.appendChild(cell);
            });
            tbody.appendChild(row);
        });
        table.appendChild(tbody);

        // Append table to the container
        tableContainer.appendChild(table);
    }

    let storedTableData = {};

    async function fetchTableData() {
        try {
            const response = await fetch('/getTableData');
            const tableData = await response.json();
            storedTableData = tableData; // Store fetched data
            return tableData;
        } catch (error) {
            console.error('Error:', error);
            throw error;
        }
    }

    function fetchAndDisplayData(tableType) {
        if (storedTableData[tableType]) {
            const data = storedTableData[tableType];
            const headers = tableHeaders[tableType];
            generateTable(data, headers);
            tableHeading.textContent = tableType.replace('_', ' ');
        }
    }

    async function displayDashboardCards() {
        dashboardCards.innerHTML = ''; // Clear previous cards

        try {
            const tableData = await fetchTableData();

            const data = [
                { title: 'Buyers', count: tableData.BUYER_COUNT, description: 'Total Buyers' },
                { title: 'Sellers', count: tableData.SELLER_COUNT, description: 'Total Sellers' },
                { title: 'Crops', count: tableData.CROP_COUNT, description: 'Total Crops' },
                { title: 'Orders', count: 24, description: 'Total Transactions in Progress' } // Assuming static count for Orders
            ];

            data.forEach(item => {
                const card = document.createElement('div');
                card.classList.add('card');

                const cardTitle = document.createElement('h2');
                cardTitle.textContent = item.title;
                card.appendChild(cardTitle);

                const cardCount = document.createElement('p');
                cardCount.classList.add('count');
                cardCount.textContent = item.count;
                card.appendChild(cardCount);

                const cardDescription = document.createElement('p');
                cardDescription.textContent = item.description;
                card.appendChild(cardDescription);

                dashboardCards.appendChild(card);
            });

            tableContainer.innerHTML = ''; // Clear the table
            tableHeading.textContent = ''; // Clear the table heading
        } catch (err) {
            console.error("Error displaying dashboard cards:", err);
        }
    }

    document.querySelectorAll('.sidebar-menu li a').forEach(anchor => {
        anchor.addEventListener('click', (event) => {
            event.preventDefault();
            const text = event.target.textContent;
            if (text === 'Dashboard') {
                displayDashboardCards();
            } else {
                const tableType = menuItems[text];
                if (tableType) {
                    fetchAndDisplayData(tableType);
                }
            }
        });
    });

    // Load Dashboard Cards by default on page load
    displayDashboardCards();
});