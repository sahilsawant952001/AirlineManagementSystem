const alert = require('alert');
const express = require('express');
const bodyparser = require('body-parser');
const mysql = require('mysql');
const ejs = require('ejs');

const app = express();

app.use(bodyparser.urlencoded({extended:true}));

app.use(express.static("public"));

const connection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'Sahil@1956',       
    database : 'dbms',
});

app.set('view engine','ejs');

app.get('/',function(req,res){
  res.render('home');
})

app.get('/about',function(req,res){
  res.render('about.ejs');
});

app.get('/query',function(req,res){
  // console.log(req.query.name,req.query.surname);
  res.render('query');
});

app.get('/view',function(req,res){
  res.render('view');
});

app.get('/employee',function(req,res){
    res.render('employee');
});

app.get('/updateflight',function(req,res){
  res.render('flight');
})

// *********** Query Page API's ****************//

// API for confirmed tickets
app.get('/query1',function(req,res){
  var id = req.query.id;
  var date = req.query.date;
  var q = 'SELECT SOURCE,DESTINATION,TICKET.TICKET_NO,FNAME,LNAME,CLASS,SEAT_NO FROM TICKET INNER JOIN PASSENGER ON PASSENGER.PID = TICKET.PID INNER JOIN BOOKED ON BOOKED.PID = TICKET.PID INNER JOIN FLIGHT ON FLIGHT.FLIGHT_CODE = TICKET.FLIGHT_ID WHERE FLIGHT_ID =? AND DATE_OF_JOURNEY =?';
  // console.log(q)
  connection.query(q,[id,date],function (error, results) {
      console.log(results);
      if(results.length==0)
      {
        res.render('nodata'); 
      }
      else
      {
        res.render('query1',{SRC:results[0].SOURCE,DEST:results[0].DESTINATION,NO:id,TDATE:results,DOJ:date});
      }
  });
})

// API for cancelled tickets
app.post('/query2',function(req,res){
  var id = req.body.id;
  var date = req.body.date;
  var q = 'SELECT SOURCE,DESTINATION,TICKET.TICKET_NO,FNAME,LNAME,CLASS,SEAT_NO FROM TICKET INNER JOIN PASSENGER ON PASSENGER.PID = TICKET.PID INNER JOIN CANCELLED ON CANCELLED.PID = TICKET.PID INNER JOIN FLIGHT ON FLIGHT.FLIGHT_CODE = TICKET.FLIGHT_ID WHERE FLIGHT_ID =? AND DATE_OF_JOURNEY =?';
  connection.query(q,[id,date],function (error, results, fields) {
      if(results.length==0)
      {
        res.render('nodata');
      }
      else
      {
        res.render('query2',{SRC:results[0].SOURCE,DEST:results[0].DESTINATION,NO:id,TDATE:results,DOJ:date});
      }
  });
})

// API for all employees of an airport 
app.post('/query3',function(req,res){
  console.log(req.body); // LOGS THE BODY HELPFUL !!
  var id=req.body.ap_id; 
  // var q='SELECT * FROM EMPLOYEE WHERE AP_ID= \'' + id + '\'';
  var q="SELECT * FROM EMPLOYEE WHERE AP_ID= ?";
  connection.query(q,[id],function(error,results,fields){
      console.log(results);
      if(results.length==0)
      {
        res.render('nodata');
      }
      else
      {
        res.render('query3',{All:results});
      }
  });

})

// API for airline--> has --> airplanes..
app.post('/query4',function(req,res){
  console.log(req.body); // LOGS THE BODY HELPFUL !!

  var id=req.body.al_id; 
  var q="SELECT * FROM AIRPLANES WHERE AIRLINE_ID= ?";
  connection.query(q,[id],function(error,results){
      console.log(results);
      // if(error!=null)
      //   return 404
      if(results.length==0)
      {
        res.render('nodata');
      }
      else
      {
        res.render('query4',{All:results});
      }
  });

})

// API FOR SRC TO DEST WITH STOPS...
app.post('/query5',function(req,res){
  console.log(req.body); // LOGS THE BODY HELPFUL !!

  var src=req.body.src;
  var dest=req.body.dest;
  var stops=parseInt(req.body.stops,10); // convert to integer..
    
  if(stops==0){
    var q='SELECT * FROM FLIGHT WHERE SOURCE= \'' + src + '\'AND DESTINATION= \'' + dest + '\'AND NO_OF_STOPS=\'' + stops + '\'';
  }
  else{
    var q='SELECT * FROM FLIGHT WHERE SOURCE= \'' + src + '\'AND DESTINATION= \'' + dest + '\'AND NO_OF_STOPS>\'' + 0 + '\'';
  }
  
  connection.query(q,function(error,results){
      console.log(results);
      if(results.length==0)
      {
        res.render('nodata');
      }
      else
      {
        res.render('query5',{All:results});
      }
  });

})

// *********** Query Page API's END ****************//



// *********** Employee Portal Page API's  ****************//


// API for deleting employee record...
app.post('/employee-delete',function(req,res){
  console.log(req.body); // LOGS THE BODY HELPFUL !!

  var id=req.body.id;
  var ap_id=55; 
  var q='DELETE FROM EMPLOYEE WHERE ID=? && AP_ID=?';
  
  connection.query(q,[id,ap_id],function(error,results,fields){
      console.log(results);
      if(results.affectedRows>0)
      {
        alert('Employee Record Deleted Successfully');
      }
      else
      {
        alert('Failed To Delete Employee Record');
      }
      res.render('employee');
  });

})

// API for Insert in Employee table...
app.post('/employee-insert',function(req,res){
  console.log(req.body); // LOGS THE BODY HELPFUL !!

  var id=req.body.id;
  var fname=req.body.fname;
  var mname=req.body.mname;
  var lname=req.body.lname;
  var sex=req.body.sex;
  var address=req.body.address;
  var jobtype=req.body.jobtype;
  var age=parseInt(req.body.age,10);         // int
  var salary=parseInt(req.body.salary,10);   // int
  var phone=req.body.phone;
  // insert is by default for Mumbai !!
  var ap_id=55; // airport id for Mumbai 

  // var q='INSERT INTO EMPLOYEE VALUES( \''+ id +'\',\''+ fname +'\',\''+ mname +'\',\''+lname+'\',\''+sex+'\',\''+address+'\',\''+jobtype+'\',\''+age+'\',\''+salary+'\',\''+phone+'\',\''+ap_id+'\')';
  var q='INSERT INTO EMPLOYEE VALUES(?,?,?,?,?,?,?,?,?,?,?)';
  // console.log(q);
  var arr=[id,fname,mname,lname,sex,address,jobtype,age,salary,phone,ap_id];
  connection.query(q,arr,function(error,results){
      console.log(results);
      if(results.affectedRows>0)
      {
        alert('Employee Record Inserted Successfully');
      }
      else
      {
        alert('Failed To Insert Employee Record');
      }
      res.render('employee');
  });

})

// API for Updating employee table
app.post('/employee-update',function(req,res){
  console.log(req.body);      // LOGS THE BODY HELPFUL !!

  var id=req.body.id; 
  var salary=parseInt(req.body.salary,10);
  var ap_id=55; // airport id for Mumbai 

  var q='UPDATE EMPLOYEE SET SALARY=? WHERE ID=? && AP_ID=?';
  // var q='UPDATE EMPLOYEE SET SALARY=? WHERE ID=? CHECK (ID IN (SELECT ID FROM EMPLOYEE WHERE AP_ID=55))';
  // var q='UPDATE EMPLOYEE SET SALARY=? WHERE ID=? IN (SELECT ID FROM EMPLOYEE WHERE AP_ID=55)';
  
  connection.query(q,[salary,id,ap_id],function(error,results){
      console.log(results);
      if(results.changedRows>0)
      {
        alert('Employee Salary Updated Successfully');
      }
      else
      {
        alert('Failed To Update Employee Salary');
      }
      res.render('employee');
  });

})


// *********** Employee Portal Page API's END ****************//



// *********** View Page API's  ****************//

// Api for fetching all the Cities 
app.post('/view_city',function(req,res){
  console.log(req.body); // LOGS THE BODY HELPFUL !!

  // var id=req.body.al_id; 
  var q="SELECT * FROM CITY";
  connection.query(q,function(error,results){
      console.log(results);
      // if(error!=null)
      //   return 404
      if(results.length==0)
      {
        res.render('nodata');
      }
      else
      {
        res.render('city',{All:results});
      }

  });

})

// Api for fetching all the airports 
app.post('/view_airport',function(req,res){
  console.log(req.body); // LOGS THE BODY HELPFUL !!

  // var id=req.body.al_id; 
  var q="SELECT * FROM Airport INNER JOIN CITY ON Airport.City_id=City.City_id ";
  connection.query(q,function(error,results){
      console.log(results);
      // if(error!=null)
      //   return 404
      if(results.length==0)
      {
        res.render('nodata');
      }
      else
      {
        res.render('airports',{All:results});
      }
  });

})


// Api for fetching all the Airlines with City_Name
app.post('/view_airline',function(req,res){
  console.log(req.body); // LOGS THE BODY HELPFUL !!

  // var id=req.body.al_id; 
  var q="SELECT * FROM Airline";
  connection.query(q,function(error,results){
      console.log(results);
      // if(error!=null)
      //   return 404
      if(results.length==0)
      {
        res.render('nodata');
      }
      else
      {
        res.render('airline',{All:results});
      }
  });

})

// Api for fetching all the distinct Airplanes 
app.post('/view_airplane',function(req,res){
  console.log(req.body); // LOGS THE BODY HELPFUL !!

  // var id=req.body.al_id; 
  var q="SELECT DISTINCT(MODEL_NAME),SEATS,YEARS_OF_SERVICE FROM Airplanes";
  connection.query(q,function(error,results){
      console.log(results);
      // if(error!=null)
      //   return 404
      if(results.length==0)
      {
        res.render('nodata');
      }
      else
      {
        res.render('airplanes',{All:results});
      }
  });

})

// *********** View Page API's END ****************//


// *********** Flight Page API's  ****************//

// API for Updating Departure of Flight 
app.post('/departure-update',function(req,res){
  console.log(req.body); // LOGS THE BODY HELPFUL !!

  var id=req.body.id; 
  var depart_time=req.body.departure;
  
  // var salary=parseInt(req.body.salary,10);

  var q='UPDATE FLIGHT SET DEPARTURE_TIME= ? WHERE FLIGHT_CODE= ?';
  
  connection.query(q,[depart_time,id],function(error,results){
      if(results.changedRows>0)
      {
        alert("Departure time Updated Successfuly");
      }
      else
      {
        alert("Failed To Update Departure Time");
      }
      res.render('flight');
  });

})

// API for Updating Arrival of Flight 
app.post('/arrival-update',function(req,res){
  console.log(req.body);    // LOGS THE BODY HELPFUL !!

  var id=req.body.id; 
  var arrival_time=req.body.arrival;
  // var salary=parseInt(req.body.salary,10);

  var q='UPDATE FLIGHT SET ARRIVAL_TIME= ? WHERE FLIGHT_CODE= ?';
  
  connection.query(q,[arrival_time,id],function(error,results){

    console.log(results);

    if(results.changedRows>0)
    {
      alert("Arrival time Updated Successfuly");
    }
    else
    {
      alert("Failed To Update Arrival Time");
    }

    res.render('flight');
  });

});


// *********** Flight Page API's end  ****************//


// Calling the server...
app.listen(3000,function(){
    console.log('Server Started At Port 3000');
})

