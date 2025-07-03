
var now;
var count;
var colour;

var red;
var green;
var blue;

var low1;
var high1;
var low2;
var high2;

var h;
var m;
var s;

var r;
var g;
var b;

var R;
var G;
var B;

var L1;
var L2;
var contrast;

var value1;
var value2;
var value3;


function startUp()
{
    var draw = setInterval(time, 1000);
    now = new Date();
    count = 0;
}

function time()
{
    red = Math.round(mapRange(now.getHours(), 0, 23, 0, 255));
    green = Math.round(mapRange(now.getMinutes(), 0, 59, 0, 255));
    blue = Math.round(mapRange(now.getSeconds(), 0, 59, 0, 255));
    console.log(blue);
    colour = red + "," + green + "," + blue;
    //console.log(colour);
    now = new Date();
    h = now.getHours();
    m = now.getMinutes();
    s = now.getSeconds();
    checkContrast(red, green, blue);
    if (h > 12)
    {
        h -= 12;
    }
    //min. contrast 4.5:1
    document.getElementById("timetxt").innerHTML = h + ":" + m + ":" + s;
    //document.body.style.background = "rgb(" + now.getHours() + ", " + now.getMinutes() + ", " + now.getSeconds() + ");";
    //document.body.style.background = "rgb(230, 100, 50)";
    document.body.style.background = "rgb(" + colour + ")";
    document.getElementById("colortxt").innerHTML = red + ", " + green + ", " + blue;
}

screen.orientation.onchange = function orientationChange()
{
    if (window.innerWidth > 1290)
    {
        document.getElementById("timetxt").className = "portrait";
        document.getElementById("colortxt").className = "portrait";
    }
    else
    {
        if (screen.orientation.type == "portrait-primary")
        {
            document.getElementById("timetxt").className = "portraitM";
            document.getElementById("colortxt").className = "portraitM";
        }
        else
        {
            document.getElementById("timetxt").className = "landscapeM";
            document.getElementById("colortxt").className = "landscapeM";
        }
    }
    console.log(document.getElementById("timetxt").className);
}

function mapRange(value, low1, high1, low2, high2) 
{
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function checkContrast(value1, value2, value3)
{
    r = value1/255
    g = value2/255
    b = value3/255

    L1 = 1;

    if(r <= 0.03928)
    {
        R = r/12.92;
    }
    else
    {
        R = ((r + 0.055)/1.055) ** 2.4;
    }

    if(g <= 0.03928)
    {
        G = g/12.92;
    }
    else
    {
        G = ((g + 0.055)/1.055) ** 2.4;
    }

    if(b <= 0.03928)
    {
        B = b/12.92;
    }
    else
    {
        B = ((b + 0.055)/1.055) ** 2.4;
    }

    L2 = 0.2126 * R + 0.7152 * G + 0.0722 * B;

    contrast = (L1 + 0.05) / (L2 + 0.05);

    if(contrast < 4.5)
    {
        document.body.style.color = "black";
    }
    else
    {
        document.body.style.color = "white";
    }
}
