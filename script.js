if(!localStorage.getItem("palette")) localStorage.setItem("palette",["red", "orange", "yellow", "green", "cyan", "blue", "purple", "pink", "black", "white"])
let palette = getPalette();
let canvasSize = 16; //will make this option between 16/32
let downedMouse = false;
let selectedColor = previousColor = "black";

function buildCanvas(){
    if (document.getElementById("canvas")) document.getElementById("canvas").remove();
    let canvas = document.createElement("div");
    canvas.id = "canvas" 
    let pixel = document.createElement("div");
    pixel.classList.add("pixel")
    pixel.classList.add(getPixelClass(canvasSize))
    document.body.append(canvas);
    for(i = 0; i < canvasSize; i++){
        for(j = 0; j < canvasSize; j++){
            let newClone = pixel.cloneNode(true);
            canvas.appendChild(newClone);
            newClone.addEventListener("mouseover", () => {
                if(downedMouse) newClone.style.backgroundColor = selectedColor; 
            })
            newClone.addEventListener("click", () => {
                newClone.style.backgroundColor = selectedColor; 
            })
        }
    }
    addMouseDownListeners(canvas)
    if(localStorage.getItem("grid") && localStorage.getItem("grid") == "yes") toggleGrid();
}

function addMouseDownListeners(domObject){
    domObject.addEventListener("mousedown", () => {
        downedMouse = true;
    })
    document.addEventListener("mouseup", () => {
        downedMouse = false;
    })
    domObject.addEventListener("touchmove", (e) => {
        let currentX = e.touches[0].clientX;
        let currentY = e.touches[0].clientY;
        console.log(currentX)
        let allPixels = document.getElementsByClassName("pixel");
        let pixelIndex = 0;
        let pixelSize = allPixels[0].getBoundingClientRect().width;
        console.log(pixelSize)
        for(i = 0; i < canvasSize; i++){
            for(j = 0; j < canvasSize; j++){
                let currentPixel = allPixels[pixelIndex];
                let currentPixelRect = currentPixel.getBoundingClientRect();
                if(currentX > currentPixelRect.left && currentX < currentPixelRect.left + pixelSize && currentY > currentPixelRect.top && currentY < currentPixelRect.top + pixelSize){
                    currentPixel.style.backgroundColor = selectedColor;
                }
                pixelIndex++;
            }
        }
    })
}

function downloadAsPNG(){
   let canvasElem = createCanvasElem();
   canvasElem.toBlob(blob => {
    let download = document.createElement("a")
    download.setAttribute("download", "pixelart" + canvasSize + "x" + canvasSize + ".png");
    let url = URL.createObjectURL(blob);
    download.setAttribute('href', url);
    download.click();
  });
}

function createCanvasElem(){
    let canvasElem = document.createElement("canvas");
    canvasElem.height = canvasSize
    canvasElem.width = canvasSize
    canvasContext = canvasElem.getContext("2d");
    let allPixels = document.getElementsByClassName("pixel")
    let pixelIndex = 0;
    for(i = 0; i < canvasSize; i++){
        for(j = 0; j < canvasSize; j++){
            let currentPixel = allPixels[pixelIndex]
            canvasContext.fillStyle = currentPixel.style.backgroundColor;
            if(currentPixel.style.backgroundColor === "") canvasContext.fillStyle = '#FFFFFF00'
            canvasContext.fillRect(j, i, 1, 1);
            pixelIndex++;
        }
    }
    return canvasElem;
}

function toggleGrid(){
    let canvas = document.getElementById("canvas");
    if (canvas.classList.contains("grid")) {
        canvas.classList.remove("grid")
        localStorage.setItem("grid", "no")
    } 
    else {
        canvas.classList.add("grid");
        localStorage.setItem("grid", "yes")
    }
}

function getPixelClass(size){
    switch(size){
        case 16:
            return "sixteen"
    }
}

function buildTools(){
    let tools = document.createElement("div");
    tools.id = "tools";
    tools.appendChild(buildPalette())
    tools.appendChild(buildPen())
    tools.appendChild(buildGrid())
    tools.appendChild(buildEraser())
    tools.appendChild(buildDownload())
    document.body.append(tools);
    addToolListeners();
}

function buildPalette(){
    let paletteElem = document.createElement("div");
    paletteElem.id = "palette"
    paletteElem.style.backgroundImage = "url(images/palette.png)"
    return paletteElem;
}

function buildPen(){
    let penElem = document.createElement("div");
    penElem.style.backgroundImage = "url(images/pen.png)"
    penElem.id = "pen"
    return penElem;
}

function buildGrid(){
    let gridElem = document.createElement("div");
    gridElem.style.backgroundImage = "url(images/grid.png)"
    gridElem.id = "grid"
    return gridElem;
}

function buildEraser(){
    let eraserElem = document.createElement("div");
    eraserElem.style.backgroundImage = "url(images/eraser.png)"
    eraserElem.id = "eraser"
    return eraserElem;
}

function buildDownload(){
    let downloadElem = document.createElement("div");
    downloadElem.style.backgroundImage = "url(images/download.png)"
    downloadElem.id = "download"
    return downloadElem;
}

function addToolListeners(){
    let penElem = document.getElementById("pen")
    let paletteElem = document.getElementById("palette")
    let eraserElem = document.getElementById("eraser")
    let gridElem = document.getElementById("grid")
    let downloadElem = document.getElementById("download")
    paletteElem.addEventListener("click", (e) => {
        if(document.getElementById("paletteSelector")) {
            document.getElementById("paletteSelector").remove();
            return;
        }
        if(e.target !== e.currentTarget) return;
        let elem = document.createElement("div");
        elem.id = "paletteSelector"
        paletteElem.append(elem);
        for(let i = 0; i < palette.length; i++){
            let colorElem = document.createElement("div")
            colorElem.classList.add("colors")
            colorElem.style.backgroundColor = palette[i]
            colorElem.textContent = " ";
            elem.appendChild(colorElem)
        }
        addColorListeners();
    })
    eraserElem.addEventListener("click", () => {
        if(selectedColor != "") previousColor = selectedColor;
        selectedColor = "";
    })
    penElem.addEventListener("click", () => {
        selectedColor = previousColor;
    })
    gridElem.addEventListener("click", () => {
        toggleGrid();
    })    
    downloadElem.addEventListener("click", () => {
        downloadAsPNG();
    })
}

function addColorListeners(){
    let colors = document.getElementsByClassName("colors")
    for (let i = 0; i < colors.length; i++){
        let color = colors[i].style.backgroundColor;
        colors[i].addEventListener("click", () => {
            document.getElementById("paletteSelector").remove();
            selectColor(color);
        })
    }
}

function addColor(newColor){
    if(isValidColor(newColor)){
        palette.push(newColor)
        selectColor(newColor)
        savePalette();
    } else {
        //add error reporting to user
    }
}

function selectColor(color){
    selectedColor = previousColor = color;
    if(selectedColor != ""){ //will add brush color changes

    }
}

function isValidColor(color){
    let s = new Option().style;
    s.color = color;
    return(!(s.color == "" || s.color == "initial" || s.color == "unset" || s.color == "inherit"))
}

function savePalette(){
    localStorage.setItem("palette", palette.toString())
}

function getPalette(){
    return localStorage.getItem("palette").split(",")
}

function resetPalette(){
    localStorage.setItem("palette",["red", "orange", "yellow", "green", "purple", "pink", "black", "white"]);
    palette = getPalette();
}

buildCanvas();
buildTools();