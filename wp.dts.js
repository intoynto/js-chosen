const path=require("path");
const fs=require("fs");
const glob=require("glob");
const moduleName="chosen";
const declareModulName="intoy-chosen";

function toScandDir(files)
{
    console.log(files);
    let data=null;

    if(!Array.isArray(files)) return data;

    if(Array.isArray(files)){

        for(let i=0; i<files.length; i++)
        {
            const fname=path.basename(files[i]);
            const polaIndex=/index\.d\.ts/;
            if(!polaIndex.test(fname))
            {
                if(!data){
                    data="";
                }              

                data+=`\n\t/*========= ${fname} ============ */\n`;
                const decla=fs.readFileSync(files[i],"utf-8");
                let lines=decla.split("\n");
                for(let j=0; j<lines.length; j++)
                {
                    lines[j]= "\t" + lines[j];
                }
                data+=lines.join("\n");
            }
        }
    }

    return data;
}

const data=toScandDir(glob.sync("./dist/src/*.d.ts"));
if(data)
{
    const before=`declare module "${declareModulName}"\n`+"{\n";    
    const after="\n}\n";

    fs.writeFileSync(`dist/${moduleName}.d.ts`,before+data+after,"utf8");
}

fs.renameSync("./dist/src","./dist/@types");
console.log("doden");