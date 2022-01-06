import express from "express";
import * as expressHbs from "express-handlebars";
import path from "path";
import { Request, Response } from "express";
import {UdyamApi} from './index';
import { Env } from "./env";
import { CredMode } from "./models/Creds";

const app = express();

const hbs = expressHbs.create({
	helpers: {},
	defaultLayout: "layout",
	partialsDir: ["src/views/partials"],
	extname: ".hbs",
});

app.engine(".hbs", hbs.engine);
app.set("view engine", ".hbs");

const viewsDir = path.join(__dirname, "views");
app.set("views", viewsDir);
const staticDir = path.join(__dirname, "public");
app.use(express.static(staticDir));
UdyamApi.init({
    mode:CredMode.prod,
    apiKey:Env.apiKey,
    pemKeyPath:Env.pemKeyPath
})
app.get('/',async (req:Request,res:Response)=>{
    
    let link=await UdyamApi.generateLink("7588763862").catch(err=>{
        console.log(err);
    })
    res.render("index",{
        data:JSON.stringify(link)
	});
})

app.listen(9000, () => {
    console.log('Server started on port: ' + 9000);  
});