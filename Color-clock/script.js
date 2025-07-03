function startUp()
{
    var draw = setInterval(time, 1000);
}

function time()
{
    let now = new Date();
    let red = Math.round(mapValue(now.getHours(), 0, 23, 0, 255));
    let green = Math.round(mapValue(now.getMinutes(), 0, 59, 0, 255));
    let blue = Math.round(mapValue(now.getSeconds(), 0, 59, 0, 255));
    let colour = [red, green, blue].join(',');
    
    let h = now.getHours();
    let m = now.getMinutes().toString().padStart(2, "0");
    let s = now.getSeconds().toString().padStart(2, "0");

    if (h > 12)
    {
        h -= 12;
    }

    checkContrast(red, green, blue);
    document.getElementById("timetxt").innerHTML = h + ":" + m + ":" + s;
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

function mapValue(value, low1, high1, low2, high2) 
{
    return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
}

function checkContrast(r, g, b)
{
    let L1 = luminance(r, g, b); // bg colour
    let L2 = 1; // text colour (white)

    let contrastRatio = (L1 > L2 ? (L1 + 0.05) / (L2 + 0.05) : (L2 + 0.05) / (L1 + 0.05)).toFixed(2);

    if (contrastRatio < 4.5)
    {
        document.body.style.color = "black";
    }
    else
    {
        document.body.style.color = "white";
    }
}

function luminance(r, g, b)
{
    var c = [r, g, b].map(function(v)
    {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return c[0] * 0.2126 + c[1] * 0.7152 + c[2] * 0.0722;
}