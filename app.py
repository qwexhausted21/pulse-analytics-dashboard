from flask import Flask, render_template, jsonify
import random
from datetime import datetime

app = Flask(__name__)

chart_history = [5000, 5200, 5100, 5500, 5800, 5700, 6200, 6500, 6800, 7000, 7200, 7500, 7900, 8100, 8500]

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/api/stats')
def get_stats():
    global chart_history
    
    last_value = chart_history[-1]
    change = random.randint(-500, 1500)
    new_point = max(1000, last_value + change)
    
    chart_history.append(new_point)
    if len(chart_history) > 20:
        chart_history.pop(0)
        
    users = ["Александр", "Екатерина", "Дмитрий", "Мария", "Иван", "Ольга", "Максим"]
    products = ["Подписка Pro", "Курс по Python", "Шаблон UI-Kit", "Консультация", "Доступ к API"]
    statuses = ["success", "success", "success", "pending"] 
    
    transaction = {
        "user": random.choice(users),
        "product": random.choice(products),
        "amount": random.randint(1000, 15000),
        "status": random.choice(statuses),
        "time": datetime.now().strftime("%H:%M:%S")
    }

    traffic = [65, 25, 10] 
    
    system_load = {
        "cpu": random.randint(15, 45),
        "ram": random.randint(40, 70),
        "storage": random.randint(60, 85)
    }

    return jsonify({
        "kpi": {
            "revenue": new_point * 20, 
            "users": random.randint(120, 150),
            "avg_check": random.randint(3500, 4500),
            "conversion": round(random.uniform(2.5, 4.5), 2)
        },
        "chart_data": chart_history,
        "traffic": traffic,
        "system_load": system_load,
        "transaction": transaction
    })

if __name__ == '__main__':
    app.run(debug=True)