const express = require('express');
const app = express();


const path = require('path');
const mongoose = require('mongoose');
const Campgroundy = require('./models/campground');
const ejsMate = require('ejs-mate');
const Joi = require('joi');
const wrapAsync = require('./utils/wrapAsync');
const ExpressError=require('./utils/ExpressError');
const {campgroundSchema}=require('./schemas');

app.engine('ejs',ejsMate);

const { urlencoded } = require('express');
const methodOverride = require('method-override');
mongoose.connect('mongodb://localhost:27017/yelp-camp',{
    useNewUrlParser: true,
    useUnifiedTopology: true

});

const db = mongoose.connection;
db.on("error", console.error.bind(console,"connection error:"));

db.once("open",()=>{
console.log("Database Connected!");
});

app.set('view engine','ejs');
app.set('views',path.join(__dirname,'views'));

app.use(express.urlencoded({extended:true}));

app.use(express.urlencoded({ extended: true }));

app.use(methodOverride('_method'));
app.get('/',(req,res)=>{
res.render('home');

});


const validateCampground=(req,res,next)=>{
    const {error} = campgroundSchema.validate(req.body,{abortEarly: false});
    if(error){
        const msg = error.details.map(el => el.message).join(',');
        throw new ExpressError(msg, 400);
    }
    else{
        next();
    }
};

app.get('/campgrounds', wrapAsync(async(req, res)=>{
const campgrounds = await Campgroundy.find({});
res.render('campgrounds/index',{campgrounds});
}));



app.get('/campgrounds/new',(req,res)=>{
res.render('campgrounds/new');

});
app.post('/campgrounds',validateCampground,wrapAsync(async(req,res)=>{
   // if(!req.body.campground) throw new ExpressError('Invalid Campground Data',400);
  
   
   
    const campground = new Campgroundy(req.body.campground);
    await campground.save();
res.redirect(`/campgrounds/${campground.id}`);
}));
app.get('/campgrounds/:id',wrapAsync(async(req,res)=>{
    const {id}=req.params;
    const campground = await Campgroundy.findById(id);
    res.render('campgrounds/show',{campground});
    }));

    app.get('/campgrounds/:id/edit',wrapAsync(async (req,res)=>{
        const {id}=req.params;
        const campground = await Campgroundy.findById(id);
        res.render('campgrounds/edit',{campground});

    }));
app.put('/campgrounds/:id',validateCampground,wrapAsync(async(req,res)=>{
    const {id} = req.params;
const campground = await Campgroundy.findByIdAndUpdate(id,{...req.body.campground});
res.redirect(`/campgrounds/${campground._id}`)

}));

app.delete('/campgrounds/:id',wrapAsync(async(req,res)=>{
const {id} = req.params;
await Campgroundy.findByIdAndDelete(id);
res.redirect(`/campgrounds`);

}));
app.all('*',(req,res,next)=>{
next(new ExpressError('Page Not Found',404));
});

app.use((err,req,res,next)=>{
    const {statusCode = 500}=err;
    if(!err.message)
    {
        err.message = "Oh nooooo!";
    }
    res.status(statusCode).render('error',{err});


});
app.listen('8000',()=>{
console.log('Working');
});