
////Comentario de David Ayala: Dimensiones del SVG y cada celda.
var width = 1140,
    height = 160,
    cellSize = 17;

d3.csv("resources/data/data.csv", function(error, data) {
  if (error) throw error;

////Comentario de David Ayala: Hubiera sido interesante poder tener la oportunidad de ajustar los breaks de los hurtos e identificar máximos y mínimos. 
var breaks = [20,40,60,80,100];

////Comentario de David Ayala: ¿Esta escala de azules no era más fácil aplicarla con d3.scaleOrdinal()?    
//var colours = ["#b6c2f1", "#8b9ee9", "#3557d9", "#1b328d", "#0b1437","#000"];
var colours = ["#f1eef6", "#d0d1e6", "#a6bddb", "#74a9cf", "#2b8cbe","#045a8d"];

var Max_Year = new Date(d3.max(data, function(d) { return d.Date; })).getFullYear();
var Min_Year = new Date(d3.min(data, function(d) { return d.Date; })).getFullYear();

//::: Labels Leyenda ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
var svg0 = d3.select("#d3_01_grafico").append("svg")
    .attr("width", width)
    .attr("height", 20);
    
var key = svg0.append("g")
    .attr("transform", "translate(" + 200 + "," + 0 + ")");

key.selectAll("rect")
    .data(colours)
    .enter()
    .append("rect")
    .attr("width",cellSize)
    .attr("height",cellSize)
    .attr("x",function(d,i){return i*130;})
    .attr("fill",function(d){return d;});
    
    key.selectAll("text")
        .data(colours)
        .enter()
        .append("text")
        .attr("x",function(d,i){return cellSize+5+(i*130);})
        .attr("y","1em")
        .attr("font-size", 15)
        .text(function(d,i){
            if(i==0){
                return (breaks[i] - breaks[0]) + " - " + breaks[i];
            }   else if (i<colours.length-1){
                return (breaks[i] - breaks[0]+1) + " - " + breaks[i];
            }   else    {
                return "> "+breaks[i-1];   
            }
        });
    
//::: svg datos por año :::::::::::::::::::::::::::::::::::::::::::::::::::::::
var svg = d3.select("#d3_02_grafico")
  .selectAll("svg")
  .data(d3.range(Max_Year, Min_Year, -1))
  .enter().append("svg")
    .attr("width", width)
    .attr("height", height)
  .append("g")
    .attr("transform", "translate(" + ((width - cellSize * 53) / 2) + "," + (height - cellSize * 7 - 1) + ")");
    
//::: Labels año ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
svg.append("text")
    .attr("x",-90)
    .attr("y",cellSize - 30)        
    .attr("text-anchor", "middle")
    .text(function(d) { return d; });

//::: Labels días :::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
var days = ['Dom','Lun','Mar','Mie','Jue','Vie','Sab'];
    days.forEach(function(d,i)    {
        svg.append("text")
        .attr("x",-5)
        .attr("y",function(d) { return (((i+1) * cellSize) - 5)})        
        .attr("font-size", 15)
        .attr("text-anchor","end")
        .text(d);
    })    
    
//::: Labels mes ::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::::
var months = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
    months.forEach(function(d,i)    {
        svg.append("text")
        .attr("x", function(d) { return (((i+1) * cellSize * 4.235) - 0)})        
        .attr("y",cellSize - 30)
        .attr("font-size", 15)
        .attr("text-anchor","end")
        .text(d);
    })    
    
//::: Dibujo del calendar, cuadros, coloreado y mensaje :::::::::::::::::::::::
 ////Comentario de David Ayala: Creación de los cuadros del día.
var rect = svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#ccc")
  .selectAll("rect")
  .data(function(d) { return d3.timeDays(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("rect")
    .attr("width", cellSize)
    .attr("height", cellSize)
    .attr("x", function(d) { return d3.timeWeek.count(d3.timeYear(d), d) * cellSize; })
    .attr("y", function(d) { return d.getDay() * cellSize; })
    .datum(d3.timeFormat("%Y-%m-%d"));

 ////Comentario de David Ayala: Creación de los bordes del mes.
svg.append("g")
    .attr("fill", "none")
    .attr("stroke", "#000")
    .attr("stroke-width",1.5)
  .selectAll("path")
  .data(function(d) { return d3.timeMonths(new Date(d, 0, 1), new Date(d + 1, 0, 1)); })
  .enter().append("path")
    .attr("d", pathMonth);

////Comentario de David Ayala: Anidado de los datos por fecha.
  var data = d3.nest()
      .key(function(d) { return d.Date; })
      .rollup(function(d) { return (d[0].Close); })
    .object(data);

  ////Comentario de David Ayala: Coloreado de los cuadrados.
    rect.filter(function(d) { return d in data; })
    .attr("fill", function(d) {
                if (data[d]<=breaks[0]) {
                    return colours[0];
                }
                for (i=0;i<breaks.length;i++){
                    if (data[d]>breaks[i] && data[d]<=breaks[i+1]){
                        return colours[i+1];
                    }
                }
                if (data[d]>breaks[breaks.length-1]){
                    return colours[colours.length-1]   
                }
            })
    ////Comentario de David Ayala: Creación de tooltip con fecha y número de hurtos.
    .append("title")
      .text(function(d) { return d + ": " + (data[d]); });
});

//::: Path de división por mes ::::::::::::::::::::::::::::::::::::::::::::::::
function pathMonth(t0) {
  var t1 = new Date(t0.getFullYear(), t0.getMonth() + 1, 0),
      d0 = t0.getDay(), w0 = d3.timeWeek.count(d3.timeYear(t0), t0),
      d1 = t1.getDay(), w1 = d3.timeWeek.count(d3.timeYear(t1), t1);
  return "M" + (w0 + 1) * cellSize + "," + d0 * cellSize
      + "H" + w0 * cellSize + "V" + 7 * cellSize
      + "H" + w1 * cellSize + "V" + (d1 + 1) * cellSize
      + "H" + (w1 + 1) * cellSize + "V" + 0
      + "H" + (w0 + 1) * cellSize + "Z";
}

////Comentario de David Ayala: En general me parece una modificacion muy buena de la implementación de Bostock de este tipo de visualización
////ya que es mucho más fácil identificar los días de la semana por los textos y la escala de color corresponde al tipo de variable ilustrada
////revisaría únicamente el asunto de cómo hacer para que los breaks estén dados más por el rango total de los datos de manera más automática
////también me parece que el texto de los tooltips podría cambiar para ser más claro, con un formato de fecha más cómodo de leer.
