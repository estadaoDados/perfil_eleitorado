var Main = (function() {

    var candidato ='eduardo campos',
        defaulCand = 'eduardo campos',
        categoria = ["idade","renda_familiar","escolaridade","regiao","condicao_municipio","religiao","cor","interesse","vida_hoje","avaliacao_governo","desejo_mudanca","2turno_aecio"],
        possibilidades = ["campos","dilma", "aecio","pastor","outros","brancos","indecisos"],
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
        },
        lista_charts = {};

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
                candidato = possibilidades.indexOf(cand) > -1 ? cand : "campos";
            });

            crossroads.routed.add(function(request, data){
                window.location.hash = "#candidato/" + encodeURI(candidato);
                _atualiza_graficos();
            });

            var a = $('.link-cand');
            for (var i=0; i<a.length; i++){
                a[i].onclick=function(e){
                    e.preventDefault();
                    var candidato = this.href.split("#candidato/").pop();
                    $("[class*=cand-].active").removeClass("active");
                    $(".cand-"+candidato).addClass("active");
                    crossroads.parse('/candidato/' + candidato);
                }
            };

            var lista_candidatos = ["campos"];

            _cria_graficos(lista_candidatos);
        });

        window.onresize = function () {
            // As of 1.1.0 the second parameter here allows you to draw
            // without reprocessing data.  This saves a lot on performance
            // when you know the data won't have changed.
            for (var i=0 ; i < categoria.length ; i++ ) {
                var chart = lista_charts[categoria[i]];
                chart.draw(0,true);
                _atualiza_background(categoria[i]);
            }
        };
    }

    function _cria_graficos(lista_candidatos){
        for (var i=0 ; i < categoria.length ; i++ ) {
            var svg = lista_svgs[categoria[i]];
            _cria_grafico(svg, lista_candidatos, categoria[i]);
        }
    }

    function _atualiza_background(categoria) {
        var svg = d3.select("#graf-" + categoria + " svg");
        d3.select("#graf-"+categoria)
            .attr("width", dimple._parentWidth(svg.node()) - 225 )
            .attr("height", dimple._parentHeight(svg.node()) - 100)
    }

    function _cria_grafico(svg, candidato, categoria) {

        data_cand = dimple.filterData(window.complete_data, "candidato", "dilma");
        data_cand = dimple.filterData(data_cand, "categoria", categoria);

        data_total = dimple.filterData(window.complete_data, "candidato", "total");
        data_total = dimple.filterData(data_total, "categoria", categoria);

        var chart = new dimple.chart(svg);
            chart.setBounds(25,30,"65%","75%");

        var x = chart.addCategoryAxis("x","dado");
            x.title= ""

        var y = chart.addMeasureAxis("y", "valor");
            y.title = "";
            y.addOrderRule(["16 a 24","25 a 34","35 a 44","45 a 54","55 ou mais"]);

        var serie_cand = chart.addSeries("candidato", dimple.plot.bar,[x, y]);
            serie_cand.data = data_cand;
            serie_cand.barGap = 0.2;

        var serie_total = chart.addSeries("candidato",dimple.plot.bar,[x, y]);
            serie_total.data = data_total;
            serie_total.stacked = false;

        chart = _configuraCores(chart);

        svg.append("text").text(categoria)
           .attr("x","37%")
           .attr("y","20px")
           .style("font-family", "sans-serif")
           .style("font-size", "20px")
           .style("color", "Black");

        chart.staggerDraw = true;
        chart.ease = "bounce";
        chart.draw(500);

        lista_charts[categoria] = chart;
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

    function _atualiza_graficos() {
        var data_cand = dimple.filterData(window.complete_data, "candidato", candidato);

        for (var i=0 ; i < categoria.length ; i++ ) {
            _atualiza_graf_categoria(data_cand, lista_charts[categoria[i]], categoria[i]);
        }
    }

    function _atualiza_graf_categoria(dados, chart, categoria){
        var data_cand = dimple.filterData(dados, "categoria", categoria);

        chart.series[0].data = data_cand;
        chart.draw(500);

        lista_charts[categoria] = chart;
    }

    return {
        inicializa: inicializa,
    };

})();

$(document).ready(function(){
    Main.inicializa();
});
