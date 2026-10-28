document.addEventListener('DOMContentLoaded', () => {
    const ctxLine = document.getElementById('revenueChart').getContext('2d');
    let gradient = ctxLine.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, 'rgba(0, 242, 254, 0.4)');
    gradient.addColorStop(1, 'rgba(0, 242, 254, 0)');

    const lineChart = new Chart(ctxLine, {
        type: 'line',
        data: {
            labels: [],
            datasets: [{
                label: 'Выручка',
                data: [],
                borderColor: '#00f2fe',
                backgroundColor: gradient,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
                fill: true,
                tension: 0.4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: { legend: { display: false } },
            scales: {
                x: { display: false },
                y: { grid: { color: 'rgba(255, 255, 255, 0.05)' }, ticks: { color: '#8b949e' } }
            },
            animation: { duration: 800 }
        }
    });

    const ctxDonut = document.getElementById('trafficChart').getContext('2d');
    const donutChart = new Chart(ctxDonut, {
        type: 'doughnut',
        data: {
            labels: ['Mobile', 'Desktop', 'Tablet'],
            datasets: [{
                data: [0, 0, 0],
                backgroundColor: ['#00f2fe', '#8b5cf6', '#10b981'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { position: 'bottom', labels: { color: '#8b949e', padding: 20, font: {size: 12} } }
            }
        }
    });

    async function updateData() {
        try {
            const response = await fetch('/api/stats');
            const data = await response.json();

            animateValue("kpi-revenue", data.kpi.revenue, " ₽");
            animateValue("kpi-users", data.kpi.users, "");
            animateValue("kpi-conversion", data.kpi.conversion, "%");
            animateValue("kpi-avg-check", data.kpi.avg_check, " ₽");

            const now = new Date();
            const timeLabel = now.getHours() + ":" + String(now.getMinutes()).padStart(2, '0') + ":" + String(now.getSeconds()).padStart(2, '0');
            
            lineChart.data.labels.push(timeLabel);
            lineChart.data.datasets[0].data.push(data.chart_data[data.chart_data.length - 1]);

            if (lineChart.data.labels.length > 20) {
                lineChart.data.labels.shift();
                lineChart.data.datasets[0].data.shift();
            }
            lineChart.update();

            donutChart.data.datasets[0].data = data.traffic;
            donutChart.update();

            document.getElementById('cpu-text').textContent = data.system_load.cpu + '%';
            document.getElementById('ram-text').textContent = data.system_load.ram + '%';
            document.getElementById('storage-text').textContent = data.system_load.storage + '%';

            document.getElementById('cpu-bar').style.width = data.system_load.cpu + '%';
            document.getElementById('ram-bar').style.width = data.system_load.ram + '%';
            document.getElementById('storage-bar').style.width = data.system_load.storage + '%';

            addTransaction(data.transaction);

        } catch (error) {
            console.error("Ошибка данных:", error);
        }
    }

    function addTransaction(trans) {
        const list = document.getElementById('transactions-list');
        const item = document.createElement('div');
        item.className = 'transaction-item';
        
        const initial = trans.user.charAt(0).toUpperCase();
        const statusClass = trans.status === 'success' ? 'success' : 'pending';
        
        item.innerHTML = `
            <div class="trans-user">
                <div class="avatar">${initial}</div>
                <div class="trans-details">
                    <p>${trans.user}</p>
                    <span>${trans.product} • ${trans.time}</span>
                </div>
            </div>
            <div class="trans-amount ${statusClass}">+${trans.amount} ₽</div>
        `;

        list.insertBefore(item, list.firstChild);
        if (list.children.length > 4) list.removeChild(list.lastChild);
    }

    function animateValue(id, endValue, suffix) {
        const obj = document.getElementById(id);
        const startValue = parseInt(obj.innerText.replace(/\D/g, '')) || 0;
        const duration = 600;
        const startTime = performance.now();

        function update(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const current = Math.floor(progress * (endValue - startValue) + startValue);
            
            obj.innerText = current.toString().replace(/\B(?=(\d{3})+(?!\d))/g, " ") + suffix;
            
            if (progress < 1) requestAnimationFrame(update);
        }
        requestAnimationFrame(update);
    }

    updateData();
    setInterval(updateData, 2000);
});