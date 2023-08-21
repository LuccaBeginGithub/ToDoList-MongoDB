//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose=require("mongoose");
const app = express();




app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));
mongoose.connect("mongodb://0.0.0.0:27017/todolistDB",{useNewUrlParser: true});

const itemSchema = new mongoose.Schema(
  {name:String}
);
const Item = mongoose.model("item",itemSchema);
const item1 = new Item(
 { name:"Welcome to your todo list."}
);
const item2 = new Item(
  {
    name:"Hit + button to create a new item."
  }
);
const item3 = new Item(
  {
    name:"<-- Hit this to delete an item."
  }
);
const defaultItems = [item1,item2,item3];

const listSchema = new mongoose.Schema({
  name:String,
  items:[itemSchema]
});
const List = mongoose.model("List",listSchema);

// Item.insertMany([item1,item2,item3]).then(
//   ()=>{
//     console.log("saved successfully");
//   }
// )
// .catch((err)=>{
//   console.log(err);
// }); 


const workItems = [];

app.get("/", function(req, res) {

Item.find().then((findItem)=>{
  res.render("list.ejs",{listTitle:"today",newListItems:findItem});
})
.catch((err)=>{
  console.log(err);
});
});

app.get("/:customListName",(req,res)=>{
  const customListName = req.params.customListName;
  
  List.findOne({name:customListName}).then((findList)=>{
    if(!findList){
      const list = new List({name:customListName,items:defaultItems});
      list.save();
      console.log("saved");
      res.redirect("/"+customListName);

    }else{
      res.render("list.ejs",{listTitle:findList.name,newListItems:findList.items});
    }
  }).catch(err=>{});
  



});



app.post("/", function(req, res){

  const itemName = req.body.newItem;
  
  const listName = req.body.list;
  const item = new Item({name:itemName});

  if(listName==="today"){
    
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName}).then((findList)=>{
        findList.items.push(item);
        findList.save();
        res.redirect("/"+listName);
    }).catch(err=>{});
  }
  
});
app.post("/delete",(req,res)=>{

  const deleteItem = req.body.checkbox;
  const listName = req.body.listName;
  if(listName==="today"){
    Item.findByIdAndRemove(deleteItem).then(() => console.log('Successfully removed'))
    .catch(err => console.log(err)); 
    res.redirect("/");
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:deleteItem}}}).then(()=>{res.redirect("/"+listName);})
    .catch(err=>{})

  }
 
});

const list = new List

app.get("/work", function(req,res){
  res.render("list", {listTitle: "Work List", newListItems: workItems});
});

app.get("/about", function(req, res){
  res.render("about");
});

app.listen(3000, function() {
  console.log("Server started on port 3000");
});
