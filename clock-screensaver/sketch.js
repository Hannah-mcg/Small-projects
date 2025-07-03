var circleX = 0;
var circleY = 0;
var count = 0;
var i = 0;
var j = 0;
var k = 0;
var secondCircle;
var minuteCircle;
var hourCircle;
var s;
var m;
var h;
var intHour;
var Raleway;
var SerifDisp;

function setup()
{
    createCanvas(windowWidth, windowHeight);
    background(164, 195, 178);
}

function draw()
{
    noStroke()
    textAlign(CENTER)
    //put hours into 12h time
    if (hour() > 12)
    {
        intHour = hour() - 12
    }
    else
    {
        intHour = hour()
    }

    //draw lines
    for (let circleY = 70; circleY <= 840; circleY += 120) 
    {
        for (let circleX = 15; circleX <= 1490; circleX += 11) 
        {
            fill(255)
            circle(circleX, circleY, 10);
        }
    }

    //draw seconds
    for (i; i < second(); i++)
    {
        s = 20 + i * (width / 60)
        circle(s, 610, 10)
    }
    if (second() == 59)
    {
        fill(164, 195, 178)
        rect(0, 600, width, 30)
    }
    fill(255)
    secondCircle = 20 + second() * (width / 60)
    circle(secondCircle, 610, 10)
    fill(164, 195, 178)
    rect((width / 2) - 30, 695, 60, 60)
    fill(255)
    textSize(50);
    textFont("DM Serif Display");
    text(second() + 1, width / 2, 740)

    //draw minutes
    for (j; j < minute(); j++)
    {
        m = 20 + j * (width / 60)
        circle(m, 368, 10)
    }
    if (minute() == 59 && second() < 1)
    {
        fill(164, 195, 178)
        rect(0, 360, width, 20)
    }
    fill(255)
    minuteCircle = 20 + minute() * (width / 60)
    circle(minuteCircle, 368, 10)
    fill(164, 195, 178)
    rect((width / 2) - 30, 460, 60, 60)
    fill(255)
    textSize(50);
    textFont("DM Serif Display");
    text(minute(), width / 2, 505)

    //draw hours
    for (k; k < intHour; k++)
    {
        h = 20 + k * (width / 12)
        circle(h, 130, 10)
    }
    if (intHour == 12 && second() < 1)
    {
        fill(164, 195, 178)
        rect(0, 120, width, 20)
    }
    fill(255)
    hourCircle = 20 + intHour * (width / 12)
    circle(hourCircle, 130, 10)
    fill(164, 195, 178)
    rect((width / 2) - 30, 220, 60, 60)
    fill(255)
    textSize(50);
    textFont("DM Serif Display");
    text(intHour + 1, width / 2, 265)

    /*
    console.log("i: " + i)
    console.log("j: " + j)
    console.log("k: " + k)
    console.log("s: " + s)
    console.log("m: " + m)
    console.log("h: " + h)
    */
}
