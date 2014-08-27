var Main = (function() {

    var candidato = null,
        defaulCand = 'dilma_ago',
        categoria = ["sexo","idade","renda_familiar","escolaridade","regiao","condicao_municipio","religiao","cor","interesse","vida_hoje","avaliacao_governo","desejo_mudanca","2turno_aecio"],
        converte_cat = {
            "sexo":"Sexo",
            "idade":"Idade",
            "renda_familiar":"Renda familiar (SM)",
            "escolaridade":"Escolaridade",
            "regiao":"Região",
            "condicao_municipio":"Condição do município",
            "religiao":"Religião",
            "cor":"Cor",
            "interesse":"Interesse nas eleições",
            "vida_hoje":"Satisfação com a vida",
            "avaliacao_governo":"Avaliação do Governo",
            "desejo_mudanca":"Desejo de mudança",
            "2turno_aecio":"2º turno com Aécio"
        },
        ordens = {
            "sexo": ["Homens","Mulheres"],
            "idade": ["16 a 24","25 a 34","35 a 44","45 a 54","55 ou mais"],
            "renda_familiar": ["Ate 1","1 a 2","2 a 5","Mais de 5"],
            "escolaridade": ["Fund. 1","Fund. 2","Médio","Superior"],
            "regiao": ["Sudeste","Nordeste","Sul","Norte/CO"],
            "condicao_municipio": ["Capital","Periferia","Interior"],
            "religiao": ["Catolica","Evangelica","Outras"],
            "cor": ["Preta ou parda","Branca","Outras"],
            "interesse": ["Muito","Médio","Nenhum"],
            "vida_hoje": ["Satisfeito","Insatisfeito"],
            "avaliacao_governo": ["Ótimo e bom","Regular","Ruim e péssimo"],
            "desejo_mudanca": ["Quer mudança","Quer continuidade"],
            "2turno_aecio": ["Dilma Rousseff","Aécio Neves","Branco e Nulo"]
        }
        possibilidades = ["campos","dilma_jul","dilma_ago", "aecio_jul","aecio_ago","pastor_jul","pastor_ago","outros_jul","outros_ago","branco_jul","branco_ago","indeciso_jul","indeciso_ago","marina13","marina10","marina_ago"],
        complete_data = null,
        meuGrafico = null,
        lista_svgs = {
            "sexo": null,
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
                candidato = possibilidades.indexOf(cand) > -1 ? cand : "dilma";
            });

            crossroads.routed.add(function(request, data){
                window.location.hash = "#candidato/" + encodeURI(candidato);
                _atualiza_graficos();
            });

            var a = $('.link-cand');
            for (var i=0; i<a.length; i++){
                a[i].onclick=function(e){
                    e.preventDefault();
                    $("#menu_candidatos .navbar-collapse").collapse('hide');
                    var candidato = this.href.split("#candidato/").pop();
                    $("[class*=cand-].active").removeClass("active");
                    $(".cand-"+candidato).addClass("active");
                    crossroads.parse('/candidato/' + candidato);
                }
            };

            $('.camada').on("click",function(){
                $(".touched").removeClass("touched");
                $(this).addClass("touched");
            });

            if(window.location.hash) {
                var cand = window.location.hash.split("#candidato/").pop()
                candidato = possibilidades.indexOf(cand) > -1 ? cand : "dilma_ago";
            } else {
                candidato = defaulCand;
            }
            $("li.cand-"+candidato).addClass("active");

            _cria_graficos();

        });
    }

    function _cria_graficos(){
        for (var i=0 ; i < categoria.length ; i++ ) {
            var svg = lista_svgs[categoria[i]];
            _cria_grafico(svg, categoria[i]);
        }
    }

    function _cria_grafico(svg, categoria) {

        data_cand = dimple.filterData(window.complete_data, "candidato", candidato);
        data_cand = dimple.filterData(data_cand, "categoria", categoria);

        data_total = dimple.filterData(window.complete_data, "candidato", "total");
        data_total = dimple.filterData(data_total, "categoria", categoria);

        var chart = new dimple.chart(svg);
            chart.setBounds(25,30,"80%","75%");

        var x = chart.addCategoryAxis("x","dado");
            x.title= ""
            x.addOrderRule(ordens[categoria]);

        var y = chart.addMeasureAxis("y", "valor");
            y.title = ""

        var serie_cand = chart.addSeries("candidato", dimple.plot.bar,[x, y]);
            serie_cand.data = data_cand;
            serie_cand.barGap = 0.2;

        var serie_total = chart.addSeries("candidato",dimple.plot.bar,[x, y]);
            serie_total.data = data_total;
            serie_total.stacked = false;

        chart = _configuraCores(chart);

        svg.append("text").text(converte_cat[categoria])
           .attr("x","50%")
           .attr("y","20px")
           .style("font-family", "sans-serif")
           .style("font-size", "18px")
           .style("color", "Black")
           .style("text-anchor","middle");

        serie_cand = altera_tooltip(serie_cand, categoria);
        serie_total = altera_tooltip_media(serie_total);

        chart.staggerDraw = true;
        chart.ease = "bounce";
        chart.draw(500);

        lista_charts[categoria] = chart;
    }

    function reordena_series() {
        for (var i=0 ; i < categoria.length ; i++ ) {
            $("#graf-" + categoria[i] + " svg .dimple-series-1").each(function(){
                this.parentNode.appendChild(this);
            });
        }
    }

    function altera_tooltip_media(serie) {
        serie.getTooltipText = function(e) {
            return ["Média: " + parseInt(e.yValue) + "%"];
        }
        return serie;
    }

    function altera_tooltip(serie, categoria) {
      // Override the standard tooltip behaviour
      serie.addEventHandler("mouseover", function (e){

        $("#dados_candidatos p").addClass("blinkText");

        // Draw the text information in the top left corner
        var recorte = e.xValue,
            valor = parseInt(e.yValue);
        $(".recorte_cat").text(e.xValue);
        $(".mostra_valor").text(valor);
        $(".nome_candidato").text($(".cand-" + candidato + " a").data("label"));

        var valor_total = dimple.filterData(window.complete_data, "candidato", "total");
            valor_total = dimple.filterData(valor_total, "categoria", categoria);
            valor_total = dimple.filterData(valor_total, "dado", recorte);

        if (parseInt(valor) > (parseInt(valor_total[0]["valor"]) + 1)) {
            $(".arrow").removeClass("menor").removeClass("igual").addClass("maior");
        } else if (parseInt(valor) < (parseInt(valor_total[0]["valor"]) - 1)) {
            $(".arrow").removeClass("maior").removeClass("igual").addClass("menor");
        } else {
            $(".arrow").removeClass("maior").removeClass("menor").addClass("igual");
        }

        $(".valor_media").text(valor_total[0]["valor"])

      });
      serie.addEventHandler("mouseout", function (e){
          $(".blinkText").removeClass("blinkText");
      });
      return serie;
    }

    function _configuraCores(grafico) {
        grafico.assignColor("aecio_jul","#34495e");
        grafico.assignColor("dilma_jul","#c0392b");
        grafico.assignColor("campos","#e67e22");
        grafico.assignColor("marina13","#e67e22");
        grafico.assignColor("marina10","#e67e22");
        grafico.assignColor("pastor_jul","#28b463");
        grafico.assignColor("outros_jul","#8e44ad");
        grafico.assignColor("indeciso_jul","#95a5a6");
        grafico.assignColor("branco_jul","#7f8c8d");
        
        grafico.assignColor("aecio_ago","#34495e");
        grafico.assignColor("dilma_ago","#c0392b");
        grafico.assignColor("campos","#e67e22");
        grafico.assignColor("marina_ago","#e67e22");
        grafico.assignColor("pastor_ago","#28b463");
        grafico.assignColor("outros_ago","#8e44ad");
        grafico.assignColor("indeciso_ago","#95a5a6");
        grafico.assignColor("branco_ago","#7f8c8d");

        grafico.assignColor("total","#181C19");
        return grafico;
    }

    function _atualiza_graficos() {
        $(".recorte_cat").text('-');
        $(".mostra_valor").text('-');
        $(".nome_candidato").text('-');

        var data_cand = dimple.filterData(window.complete_data, "candidato", candidato);

        for (var i=0 ; i < categoria.length ; i++ ) {
            _atualiza_graf_categoria(data_cand, lista_charts[categoria[i]], categoria[i]);
        }
        if (!$(".touched")){
            $("#graf-regiao").parent().addClass("touched");
        }
        reordena_series();
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
