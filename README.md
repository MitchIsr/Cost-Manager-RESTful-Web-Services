Deployed at 
https://async-users.onrender.com
https://async-logs.onrender.com
https://async-about.onrender.com
https://async-costs.onrender.com

Service Names: {users,logs,about,report}

GET Response add: api/<Service Name> 

GET specific user details: https://async-users.onrender.com/api/users/123123
GET All Users: https://async-users.onrender.com/api/users
GET Report https://async-costs.onrender.com/api/report?id=123123&year=2026&month=5
GET LOGS https://async-logs.onrender.com/api/logs
GET About https://async-about.onrender.com/api/about

POST Response api/add
POST ADD New User  requests.post("https://async-users.onrender.com/api/add" , json = {'id': 123123, 'first_name': 'mosh','last_name': 'israeli','birthday': '1990-01-01'})
POST ADD Costs Item requests.post("https://async-costs.onrender.com/api/add", json = {'userid': 123123, 'description': 'milk 9', 'category': 'food', 'sum': 8})
