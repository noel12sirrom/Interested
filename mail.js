const firebaseConfig = {
    apiKey: "AIzaSyBDnRBNWRHtUQsM_RJNSFUL-SU-ALAtl8A",
    authDomain: "linkup-c3274.firebaseapp.com",
    databaseURL: "https://linkup-c3274-default-rtdb.firebaseio.com",
    projectId: "linkup-c3274",
    storageBucket: "linkup-c3274.firebasestorage.app",
    messagingSenderId: "618853464271",
    appId: "1:618853464271:web:0c434109eaffb2edf11fba"
  };

  firebase.initializeApp(firebaseConfig);

  var usersDB = firebase.database().ref("users");

  document.getElementById("login-form").addEventListener("submit", function(e){
    e.preventDefault();

    var email = document.getElementById("email").value;
    var password = document.getElementById("password").value;

    firebase.auth().signInWithEmailAndPassword(email, password).then(function(user){
      alert("Login successful");
    }).catch(function(error){
      alert("Login failed: " + error.message);
    });
  });
  
  
  
