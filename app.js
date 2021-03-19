const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const lodash = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://Pranav:8867137015@cluster0.jwixq.mongodb.net/todolistDB", {useNewUrlParser: true});

const itemsSchema = {
  name: String
};

const listSchema = {
  name: String,
  items: [itemsSchema]
};

const userSchema = {
  username: {
    type: String,
    unique: true},
  password: String,
  lists: [listSchema]
}

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);
const User = mongoose.model("User", userSchema);

const item1 = new Item({
  name: "Welcome to your todolist"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1, item2, item3];

const defaultList = new List({
  name: "Today",
  items: defaultItems
})

app.get("/sign-up", function(req, res){
  res.render("signup");
})

app.get("/", function(req, res){
  res.render("login");
})

app.get("/user/:username", function (req, res){

res.redirect("/user/" + req.params.username + "/today");

});

app.get("/user/:username/:customList", function(req, res){
  const customListName = lodash.capitalize(req.params.customList);
  const username =  req.params.username;

  User.findOne({username: username}, function(err, foundUser){
    if(!err && foundUser){
      foundUser.lists.forEach(function(list){
        if(list.name!=customListName) {
            const newlist = new List({
            name: customListName,
            items: defaultItems
          });
          foundUser.lists.push(newlist);
          foundUser.save();
          res.redirect("/user/"+ username + "/" + customListName)
        }
        else{
          res.render("list", {listtitle: list.name, newlistitem: list.items, username: username})
        }
      });
    }
    else{
      console.log("User not found");
    }
  });
});

app.get("/about", function(req, res){
  res.render("about");
})

app.post("/", function(req, res){
    const username = req.body.uname;
    const password = req.body.psw;

  User.findOne({username: username, password: password}, function(err, foundUser){
    if(!err){
      res.redirect("/user/" + username);
    }
    else {
      console.log(err);
      res.redirect("/");
    }
    });
  });

app.post("/sign-up", function(req, res){
  const username = req.body.uname;
  const password = req.body.psw;

  const user = new User ({
    username: username,
    password: password,
    lists: [defaultList]
  });

  user.save(function(err){
    if(!err){
      res.redirect("/");
    }
    else{
      res.redirect("/sign-up");
    }
  });
});

app.post("/user/:username", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;
  const username = req.params.username;

  const item = new Item ({
    name: itemName
  });
  User.findOne({username: username}, function(err, foundUser){
    if(!err){
      foundUser.lists.forEach(function(list){
        if(list.name === listName) {
          list.items.push(item);
          foundUser.save();
          res.redirect("/user/"+ username + "/" + listName)
        }
      });
    }
    else{
      console.log(err);
    }
  });
});

app.post("/delete", function(req, res){
  const checkeditem = req.body.checkbox;
  const listName = req.body.listName;
  const username = req.body.username;

  User.findOne({username: username}, function(err, foundUser){
    foundUser.lists.forEach(function(list){
      if(list.name==listName){
        list.items.forEach(function(item){
          if (item._id == checkeditem){
            list.items.pop(item);
            foundUser.save(function(err){
              if(!err){
                res.redirect("/user/" + username + "/" + listName);
              }
            });
          }
        })
      }
    })
  })
});

let port = process.env.PORT;
if (port == null || port == ""){
port = 3000;
}

app.listen (port, function (){
  console.log("Server started successfully");
});
