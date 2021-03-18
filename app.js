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

const Item = mongoose.model("Item", itemsSchema);
const List = mongoose.model("List", listSchema);

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

app.get("/", function (req, res){

  Item.find({}, function(err, foundItems){

    if(foundItems.length==0){
      Item.insertMany(defaultItems, function(err){
        if (err){
          console.log(err);
        }
      });
      res.redirect("/");
    }
    else {
      res.render("list", {listtitle: "Today",  newlistitem: foundItems});
    }
  });

});

app.get("/:customList", function(req, res){
  const customListName = lodash.capitalize(req.params.customList);

  List.findOne({name: customListName}, function(err, foundList){
  if(!err){
    if(!foundList){
      const list = new List({
        name: customListName,
        items: defaultItems
      });

      list.save();
      res.redirect("/"+customListName)
    }
    else{
      res.render("list", {listtitle: foundList.name, newlistitem: foundList.items})
    }
  }
})
})

app.get("/about", function(req, res){
  res.render("about");
})

app.post("/", function(req, res){
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item ({
    name: itemName
  });

  if(listName === "Today"){
    item.save();
    res.redirect("/");
  }
  else{
    List.findOne({name: listName}, function(err, foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", function(req, res){
  const checkeditem = req.body.checkbox;
  const listName = req.body.listName;

  if(listName=== "Today"){
    Item.findByIdAndRemove(checkeditem, function(err){
      if(err){
        console.log(err);
      }
      else{
        res.redirect("/");
      }
    });
  }
  else{
    List.findOneAndUpdate({name: listName}, {$pull: {items: {_id: checkeditem}}}, function(err, foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }
});


app.listen (3000, function (){
  console.log("Server started on port 3000");
});
