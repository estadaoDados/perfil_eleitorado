var Main = (function() {

    var candidato ='eduardo campos',
        defaulCand = 'eduardo campos',
        possibilidades = ["eduardo campos","dilma roussseff", "aecio neves","pastor everaldo","outros","brancos e nulos","indecisos"],
        complete_data = null,
        meuGrafico = null,
        svg = null;

    function inicializa() {
        //TODO: Criar os 12 svgs
        svg = dimple.newSvg("#graf-idade", "100%", "80%");

        //desenha grafico
        d3.csv("dados/dados_perfil.csv", function (data) {
            window.complete_data = data;

            crossroads.addRoute('/candidato/{cand}', function(cand){
                cand = decodeURI(cand);
                candidato = possibilidades.indexOf(cand) > -1 ? cand : defaultFilters.pergunta;
            });

            crossroads.routed.add(function(request, data){
                window.location.hash = "#candidato/" + encodeURI(candidato);
                _atualiza_grafico();
            });

            var a = $('.link-cand');
            for (var i=0; i<a.length; i++){
                a[i].onclick=function(e){
                    e.preventDefault();
                    crossroads.parse('/candidato/' + this.href.split("#candidato/").pop());
                }
            };

            _cria_grafico();
        });

        window.onresize = function () {
            // As of 1.1.0 the second parameter here allows you to draw
            // without reprocessing data.  This saves a lot on performance
            // when you know the data won't have changed.
            chart.draw(0, true);
            _atualiza_background();
        };
    }

    function _atualiza_background() {
        d3.select("#background_plot_area")
            .attr("width", dimple._parentWidth(svg.node()) - 225 )
            .attr("height", dimple._parentHeight(svg.node()) - 100)
    }

    function _cria_grafico() {
        data = dimple.filterData(window.complete_data, "candidato", ["total","dilma"])
        data = dimple.filterData(data, "categoria", "idade")
        var myChart = new dimple.chart(svg, data);
        myChart.setBounds(45,20,"85%","80%");
        myChart.setMargins("60px","30px","165px","70px");
        myChart.addMeasureAxis("y", "valor");
        var y = myChart.addCategoryAxis("x", ["dado","candidato"]);
        y.title = ""
        series = myChart.addSeries("candidato", dimple.plot.bar);
        series.barGap = 0.42;
        y.overrideMin = 3500;  
        myChart.draw();
    }

    function _ordemLegenda(recorte) {
    }

    function _configuraCores(grafico, pergunta) {
    }


    function _limpar_legendas() {
        $('*[class^="dimple-legend"]').remove()
    }

    function _atualiza_grafico() {
    }

    function atualiza_recorte(cat_recorte, recorte, texto){
        _atualiza_grafico({cat_recorte: cat_recorte, recorte: recorte, texto_recorte: texto});
    }

    function atualiza_pergunta(pergunta, texto){
        _atualiza_grafico({pergunta: pergunta, texto_pergunta: texto})
    }

    return {
        inicializa: inicializa,
    };

})();

$(document).ready(function(){
    Main.inicializa();
});
