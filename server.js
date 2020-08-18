const express=require('express');
const app =express();
const connectDB=require('./config/db');
//connect the database
connectDB();
app.get('/',async(req,res)=>{
    res.send('API running')
})

//init middleware
app.use(express.json({extended:false})); 
//Define routes
app.use('/api/users',require('./routes/api/users'))
app.use('/api/profile',require('./routes/api/profile'))
app.use('/api/auth',require('./routes/api/auth'))
app.use('/api/posts',require('./routes/api/posts'))


const PORT=process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Running node server at PORT 5000`)
})