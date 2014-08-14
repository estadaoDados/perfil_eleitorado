var Main = (function() {

    var candidato ='eduardo campos',
        defaulCand = 'eduardo campos',
        categoria = ["idade","renda_familiar","escolaridade","regiao","condicao_municipio","religiao","cor","interesse","vida_hoje","avaliacao_governo","desejo_mudanca","2turno_aecio"],
        possibilidades = ["eduardo campos","dilma roussseff", "aecio neves","pastor everaldo","outros","brancos e nulos","indecisos"],
        complete_data = null,
        meuGrafico = null,
        lista_svgs = {
            "idade": null,
            "renda_familiar": null,
            "escolaridade": null,
            "regiao": null,
            "condicao_municipio": null,
            "religiao": null,
            "cor": null,
            "interesse": null,
            "vida_hoje": null,
            "avaliacao_governo": null,
            "desejo_mudanca": null,
            "2turno_aecio": null
        };

    function inicializa() {
        //TODO: Criar os 12 svgs
        for (var i=0 ; i < categoria.length ; i++) {
            var svg = dimple.newSvg("#graf-"+categoria[i], "100%", "80%");
            d3.select("#graf-"+categoria[i]+" svg")
                .attr("width", dimple._parentWidth(svg.node()) + "px")
                .attr("height", dimple._parentWidth(svg.node())*1.2 + "px");
            lista_svgs[categoria[i]] = svg;
        }

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

            var lista_candidatos = ["dilma"];

            _cria_graficos(lista_candidatos);
        });

        window.onresize = function () {
            // As of 1.1.0 the second parameter here allows you to draw
            // without reprocessing data.  This saves a lot on performance
            // when you know the data won't have changed.
            //chart.draw(0, true);
            //_atualiza_background();
        };
    }

    function _cria_graficos(lista_candidatos){
        for (var i=0 ; i < categoria.length ; i++ ) {
            var svg = lista_svgs[categoria[i]];
            _cria_grafico(svg, lista_candidatos, categoria[i]);
        }
    }

    function _atualiza_background() {
        d3.select("#background_plot_area")
            .attr("width", dimple._parentWidth(svg.node()) - 225 )
            .attr("height", dimple._parentHeight(svg.node()) - 100)
    }

    function _cria_grafico(svg, lista_candidatos, categoria) {
        if (lista_candidatos.indexOf("total") == -1) {
            lista_candidatos.unshift("total");
        }
        data = dimple.filterData(window.complete_data, "candidato", "dilma")
        data_total = dimple.filterData(window.complete_data, "candidato", "total")
        data = dimple.filterData(data, "categoria", categoria)
        data_total = dimple.filterData(data_total, "categoria", categoria)
        var myChart = new dimple.chart(svg, data);
        myChart.setBounds(45,30,"80%","65%");
        //myChart.setMargins("10px","0px","10px","40px");
        myChart.addMeasureAxis("y", "valor");
        var y = myChart.addCategoryAxis("x", "dado");
        y.title = ""
        y.addOrderRule(["16 a 24","25 a 34","35 a 44","45 a 54","55 ou mais"])
        y.addGroupOrderRule(["total","dilma"])
        series = myChart.addSeries("candidato", dimple.plot.bar);
        series.addOrderRule(["total","dilma"])
        series.barGap = 0.3;
        
       var myChart2 = new dimple.chart(svg, data_total);
       myChart2.setBounds(45,20,"85%","80%");

        var y2 = myChart2.addCategoryAxis("x", "dado");
        y2.addOrderRule(["16 a 24","25 a 34","35 a 44","45 a 54","55 ou mais"])
        
        y2.title = "";
        //myChart.setMargins("60px","30px","165px","70px");
        myChart2.addMeasureAxis("y", "valor");
        series2 = myChart2.addSeries("candidato", dimple.plot.bar);
        series2.stacked = false
        
        svg.append("text").text(categoria)
           .attr("x","37%")
           .attr("y","20px")
           .style("font-family", "sans-serif")
           .style("font-size", "20px")
           .style("color", "Black");

        myChart = _configuraCores(myChart)
        myChart2 = _configuraCores(myChart2)
        myChart.draw();
        myChart2.draw();
    }

    function _ordemLegenda(recorte) {
    }

    function _configuraCores(grafico) {
        grafico.assignColor("aecio","#1C4587");
        grafico.assignColor("dilma","#CC0000");
        grafico.assignColor("campos","#E69138");
        grafico.assignColor("pastor","#6AA84F");
        grafico.assignColor("indeciso","#2E2B2D");
        grafico.assignColor("branco","#C9C9C9");
        grafico.assignColor("total","#181C19")
        return grafico;
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
