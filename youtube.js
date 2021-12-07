//curent task : name of playist,view total no of vedios:-

const { contents } = require("cheerio/lib/api/traversing");
const  puppeteer = require("puppeteer");

let page;
(async function fn() {
    let browser = await puppeteer .launch({
        headless: false,
        defaultViewport :null,
        args: ["--start-maximized"],
    })
    page = await browser.newPage();
    await page.goto("https://www.youtube.com/playlist?list=PLzkuLC6Yvumv_Rd5apfPRWEcjf9b1JRnq");

  

    await page.waitForSelector('h1[id="title"]')
    //first element give

    let element = await page.$('h1[id="title"]')
    let value = await page.evaluate(
        function(element){
            return element.textContent
        },element);
    
    console.log("title" , value);
   // all occurance in form of array:-

    let someList = await page.$$(".style-scope.ytd-playlist-sidebar-primary-info-renderer");
    value = await page.evaluate(
        function(element){
            return element.textContent
        },someList[5]);
    console.log("videos" , value);

    let videos = value.split(" ")[0].trim();

    let someList1 = await page.$$(".style-scope.ytd-playlist-sidebar-primary-info-renderer");
    value = await page.evaluate(
        function(element){
            return element.textContent
        },someList1[6]);
    console.log("views" , value);
   
//time

    // let timeList = await page.$$('span[id = "text"]');
    // console.log("timeList",timeList.length);

    // name of thee video
    // let vedioNameElementList = await page.$$("a[id='video-title']");
    // console.log("vedioNameElementList", vedioNameElementList.length);
    
    
    
    
    
    // .circle.style-scope.tp-yt-paper-spinner
    //792 ke liye 7 baar hi scrool karna pdta hai
    let loopCount  = Math.floor(videos/100);
    
    //7 baar scroll to kar diya par image and time baadh mei ataa hai
    for(let i = 0; i < loopCount; i++){
        //load start.....Scroll karo
        await page.click(".circle.style-scope.tp-yt-paper-spinner");
        // jab tak agli video nahi ati jab tak wait karta rahata.. uske baaadh alge 100 ko call marta hai 
        //load finish.....wait karo....
        await waitTillHTMLRendered(page);
        console.log("loaded the new videos");
        
    }
    //loader done scrolling
    //video name:

    let videoNameElementList = await page.$$("a[id='video-title']");
    // console.log("vedioNmaeElementList", videoNameElementList);
    
    //last video ko view mei le ayee
    let lastVideo =  videoNameElementList[videoNameElementList.length -1];

    //last video view:-
    await page.evaluate(function(elem){
        elem.scrollIntoView();
    },lastVideo);

    //time
    await page.waitFor(3000);
    let timeList = await page.$$("span[id = 'text']");
    console.log("timeList" , timeList.length);
    
    let videoArr = [];
    
    for(let i = 0; i < timeList.length; i++){
        let timeNTitleObj = await page.evaluate(getTimeAndTitle, timeList[i],videoNameElementList[i]);
        videoArr.push(timeNTitleObj);   
    }
    console.table(videoArr);
    // let videosArr = [];
    // for (let i = 0; i < videoNameElementList.length; i++) {
    //     let timeNTitleObj = await page.evaluate(getTimeAndTitle, timeList[i], videoNameElementList[i]);
    //     videosArr.push(timeNTitleObj);
    // }
    // console.table(videosArr);


})();

function getTimeAndTitle(element1 , element2){
    return{
        time: element1.textContent.trim(),
        title: element2.textContent.trim()
    }

}

const waitTillHTMLRendered = async (page, timeout = 10000) => {
    const checkDurationMsecs = 1000;
    const maxChecks = timeout / checkDurationMsecs;
    let lastHTMLSize = 0;
    let checkCounts = 1;
    let countStableSizeIterations = 0;
    const minStableSizeIterations = 3;
    while (checkCounts++ <= maxChecks) {
        // html
        let html = await page.content();
        let currentHTMLSize = html.length;
        // body part
        console.log('last: ', lastHTMLSize, ' <> curr: ', currentHTMLSize);
        if (lastHTMLSize != 0 && currentHTMLSize == lastHTMLSize)
            countStableSizeIterations++;
        else
            countStableSizeIterations = 0; //reset the counter

        if (countStableSizeIterations >= minStableSizeIterations) {
            console.log("Page rendered fully..");
            break;
        }
        lastHTMLSize = currentHTMLSize;
        await page.waitFor(checkDurationMsecs);
    }
};