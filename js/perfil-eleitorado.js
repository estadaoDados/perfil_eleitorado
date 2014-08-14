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
            lista_svgs[categoria[i]] = dimple.newSvg("#graf-"+categoria[i], "100%", "80%");
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
            chart.draw(0, true);
            _atualiza_background();
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
        data = dimple.filterData(window.complete_data, "candidato", lista_candidatos)
        data = dimple.filterData(data, "categoria", categoria)
        var myChart = new dimple.chart(svg, data);
        myChart.setBounds(45,20,"85%","80%");
        //myChart.setMargins("60px","30px","165px","70px");
        myChart.addMeasureAxis("y", "valor");
        var y = myChart.addCategoryAxis("x", ["dado","candidato"]);
        y.title = ""
        series = myChart.addSeries("candidato", dimple.plot.bar);
        series.barGap = 0.42;
        svg
   	 	    .append("text").text(categoria)
   		    .attr("x","37%")
   		    .attr("y","20px")
           .style("font-family", "sans-serif")
           .style("font-size", "20px")
           .style("color", "Black");			;

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
