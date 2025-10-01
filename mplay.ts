import { Fragrant } from "fragrant";
import { randomUUID } from "crypto";
import * as mplayer from "play-sound";
import * as path from "path";
import * as wget from "wget-improved";
import * as fs from "fs";

const player = mplayer();
const fragrant = new Fragrant({ usage: "-h / --help :: show this message\n\nplay PATH_URL :: play music from a local file or a url", sensitivity: "high" });

function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

fragrant.add(
    "call",
    [{
        flag: "-h"
    },{
        flag: "--help"
    }]
)

fragrant.add(
    "middle",
    [
        {
            flag: "play",
            help: "play PATH :: playing music, includes an existing path or url"
        }
    ]
)

fragrant.on("find", (args) => {
    if (args.flag == "-h" || args.flag == "--help"){
        console.log("-h / --help :: show this message\n\nplay PATH :: play music");
        process.exit(0);
    } else if (args.flag == "play"){
        if (args.value == undefined){
            console.error("no input found");
            process.exit(0);
        } else if (!fs.existsSync(args.value as string)){
            if (!isValidUrl(args.value as string)){
                console.error("path does not exist or url is not valid:", args.value);
                process.exit(0);
            } else {
                console.log("url found");
                let outputPath = path.join(__dirname, randomUUID() + ".mplay");
                console.log(`output will be: ${outputPath}`);
                let wdown = wget.download(args.value as string, outputPath);
                wdown.on("error", (err) => {
                    if (err){
                        console.error(`error while downloading file: ${err}`);
                        process.exit(1);
                    }
                })

                wdown.on('start', (fileSize) => {
                    console.log(`file size: ${fileSize}`);
                });

                wdown.on('end', function(output) {
                    console.log("path:", output);
                    console.log("trying to play ...");
                    player.play(output as string, (err) => {
                        console.log("music has played");
                        if (err){
                            console.error(`error: ${err}`);
                            process.exit(0);
                        } else {
                            console.log("music has ended");
                        }
                    })
                });
            }
            
        } else {
            console.log("file path exists");
            console.log("path:", args.value);
            console.log("trying to play ...");
            player.play(args.value as string, (err) => {
                console.log("music has played");
                if (err){
                    console.error(`error: ${err}`);
                    process.exit(0);
                } else {
                    console.log("music has ended");
                }
            })
        }
    }
})

fragrant.parse();
