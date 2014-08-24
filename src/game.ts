class Ship {

    constructor(public name: string, public capacity: number, public description: string) {

    }

}

var ships: { [id: string]: Ship } = {
    "shuttle": new Ship("MK I Shuttlecraft", 5, "The shuttles were never known for their elegance or defensive ability, but they're reliable and often the only thing an independent trader can afford. <strong>The shuttle can hold five items.</strong>")
};

class Card {

    constructor(public type: string, public name: string, public price: number) {

    }
}

var cards: { [id: string]: Card } = {};

var addCard = (card: Card) => {
    cards[card.type] = card;
};

addCard(new Card("fuel", "Fuel", 50));
addCard(new Card("food", "Food", 100));
addCard(new Card("medicine", "Medical supplies", 200));
addCard(new Card("luxury", "Luxury goods", 500));
addCard(new Card("tech", "Technology", 500));

class GameState {
    public market: Card[] = [];
    public cards: Card[] = [];
    public credits: number;
    public shipModel: string;

    constructor() {

        this.cards.push(cards["fuel"]);
        this.cards.push(cards["fuel"]);
        this.cards.push(cards["food"]);

        this.credits = 100;
        this.shipModel = "shuttle";
    }

    hasFuel(): boolean {

        return $.grep(this.cards, (v) => v.type === "fuel").length > 0;

    }

    removeCardFromHand(type: string): boolean {

        var types = $.map(this.cards, (v, i) => v.type),
            ix = $.inArray(type, types);

        if (ix > -1) {
            this.cards.splice(ix, 1);
            return true;
        }

        return false;
    }

    removeFuelFromHand(): boolean {
        return this.removeCardFromHand("fuel");
    }

}

class GameMain2 {

    private $container: JQuery;
    private $credits: JQuery;
    private $shipmake: JQuery;
    private $tooltip: JQuery;
    private $planetDash: JQuery;
    private svg: D3.Selection;
    private currentPlanet: any;

    private state: GameState;

    constructor(private container: HTMLElement, private graphWidth: number, private graphHeight: number) {

        this.state = new GameState();
        this.$container = $(container);
    }

    renderCard(type: string, price: number, showPrice: boolean): JQuery {

        var $card = $("<a>").addClass("card").addClass(type);

        if (price && showPrice) {
            $card.append($("<span>").addClass("sellPrice").text(price));
        } else {
            $card.html("&nbsp;");
        }

        return $card;

    }

    buyCard(planet: any, type: string, price: number): void {

        this.$tooltip.hide();

        var types = $.map(this.state.market, (v, i) => v.type),
            ix = $.inArray(type, types);

        if (ix < 0) {
            alert("You can't buy a card that doesn't exist!");
        }

        this.state.market.splice(ix, 1);

        this.state.cards.push(cards[type]);
        this.state.credits -= price;

        this.setPlanet(planet);

    }

    playCard(planet: any, type: string, price: number): void {

        this.$tooltip.hide();

        var types = $.map(this.state.cards, (v, i) => v.type),
            ix = $.inArray(type, types);

        if (ix < 0) {
            alert("You can't play a card you don't have!");
        }

        this.state.cards.splice(ix, 1);
        this.state.credits += price;

        this.setPlanet(planet);
    }

    dealMarketCards(prices: { [id: string]: number }, slots: number, clear: boolean): void {

        var marketCards: Card[] = clear ? [] : $.grep(this.state.market, (v, i) => v.type !== "fuel"),
            types: string[] = <string[]>$.map(prices, (v, i) => i),
            keys: string[] = $.grep(types, (v, i) => v !== "fuel" && prices[v] <= cards[v].price),
            key: string,
            rind: number;

        if (types.length == 0) {
            this.state.market = [];
            return;
        }

        if (keys.length > 0) {

            while (marketCards.length < slots) {

                rind = Math.floor(Math.random() * keys.length);

                marketCards.push(cards[keys[rind]]);
            }

        }

        if ($.inArray("fuel", types) > -1) {
            marketCards.push(cards["fuel"]);
        }

        this.state.market = marketCards;
    }

    tryMovePlanet(planet: any, graph: D3.Layout.ForceLayout) {

        var links = graph.links(), current = this.currentPlanet;

        if (current === planet) {
            alert("You are already there!");
            return;
        }

        var paths = $.grep(links, (v) => (v.source === current && v.target === planet) || (v.source === planet && v.target === current));

        if (paths.length === 0) {
            alert("You can only jump one system at a time");
        } else if (this.state.removeFuelFromHand()) {
            this.setPlanet(planet);
        } else {
            alert("You don't have enough fuel to carry out the jump!");
        }

        console.log(this.currentPlanet, planet, graph);
    }

    setPlanet(planet: any): void {

        var d = this.$planetDash,
            $market,
            $hand,
            traded: string[] = [], prices: { [id: string]: number; } = {},
            newPlanet: boolean = this.currentPlanet !== planet,
            cardCount: number = 0,
            state = this.state,
            sellable: number = 0;

        this.currentPlanet = planet;

        this.$credits.text(this.state.credits);
        this.$shipmake.text(ships[this.state.shipModel].name);

        d.empty();

        d.append($("<h2>").text(planet.name));
        d.append($("<div>").text(planet.description).addClass("summary"));

        d.append($("<h3>").text("Market"));
        d.append($market = $("<div>").addClass("marketCards"));
        d.append($("<h3>").text("Your hand"));
        d.append($hand = $("<div>").addClass("playerCards"));

        $.each(planet.trade, (i, v) => {
            traded.push(v[0]);
            prices[v[0]] = Math.floor(cards[v[0]].price * v[1]);
        });

        this.dealMarketCards(prices, planet.slots, newPlanet);

        $.each(state.cards, (i, v) => {

            var enable = $.inArray(v.type, traded) != -1 && v.type !== "fuel",
                card = this.renderCard(v.type, prices[v.type], enable);

            if (!enable) {
                card.addClass("disabled");
            } else {

                sellable += prices[v.type];

                card.on("click", () => this.playCard(planet, v.type, prices[v.type]));
                card.on("mousemove", () => this.showSellTooltip(v.name, prices[v.type]));
                card.on("mouseout", () => this.$tooltip.hide());
            }

            $hand.append(card);

            cardCount++;

        });

        $.each(state.market, (i, v) => {

            var playerHandFull = state.cards.length >= ships[state.shipModel].capacity,
                enable = prices[v.type] <= state.credits && !playerHandFull,
                card = this.renderCard(v.type, prices[v.type], enable);

            if (!enable) {
                card.addClass("disabled");
            } else {
                card.on("click", () => this.buyCard(planet, v.type, prices[v.type]));
                card.on("mousemove", () => this.showBuyTooltip(v.name, prices[v.type]));
                card.on("mouseout", () => this.$tooltip.hide());
            }

            $market.append(card);

            cardCount++;

        });

        while (cardCount < ships[this.state.shipModel].capacity) {
            $hand.append($("<span>").html("&nbsp").addClass("cardPlaceholder"));
            cardCount++;
        }



        if (!this.state.hasFuel() && (!prices["fuel"] || prices["fuel"] > (this.state.credits + sellable))) {
            alert("You've run out of fuel. You're at the journey's end...");
            d.empty();
            d.append($("<div>").addClass("gameOver").append($("<h2>").text("Game over")));
        }

        d.show();
    }

    showGameOver() {

    }

    showTooltip() {

        var graphicsElem = <HTMLElement>this.svg[0][0],
            bodyRect = document.body.getBoundingClientRect(),
            elemRect = graphicsElem.getBoundingClientRect(),
            offsetLeft = elemRect.left - bodyRect.left + elemRect.width,
            offsetTop = elemRect.top - bodyRect.top;

        this.$tooltip.css("left", offsetLeft);
        this.$tooltip.css("top", offsetTop);
        this.$tooltip.show();

    }

    setRandomPlanet(planet: any[]) {

        var ix = Math.floor(Math.random() * planet.length);

        this.setPlanet(planet[ix]);

    }

    showBuyTooltip(name: string, price: number) {

        var t = this.$tooltip, $summary;

        t.empty();
        t.append($("<h2>").text("Action"));

        t.append($summary = $("<div>").addClass("summary"));

        t.append("Click card to buy ");
        t.append($("<strong>").text(name));
        t.append(" for ");
        t.append(price.toString());
        t.append("credits.");

        this.showTooltip();
    }

    showSellTooltip(name: string, price: number) {

        var t = this.$tooltip, $summary;

        t.empty();
        t.append($("<h2>").text("Action"));

        t.append($summary = $("<div>").addClass("summary"));

        t.append("Click card to sell ");
        t.append($("<strong>").text(name));
        t.append(" for ");
        t.append(price.toString());
        t.append("credits.");

        this.showTooltip();
    }

    showShipTooltip() {

        var t = this.$tooltip, ship = ships[this.state.shipModel];

        t.empty();
        t.append($("<h2>").text(ship.name));

        t.append($("<div>").html(ship.description).addClass("summary"));

        this.showTooltip();

    }

    showPlanetTooltip(planet: any) {

        var t = this.$tooltip, $ul, $li, i, g;

        t.empty();
        t.append($("<h2>").text(planet.name));

        t.append($("<h3>").text("Trade:"));
        t.append($ul = $("<ul>"));

        if (planet["trade"]) {

            for (i in planet.trade) {
                g = planet.trade[i];

                $li = $("<li>").text(cards[g[0]].name);

                if (g[1] < 0.7) {
                    $li.addClass("cheap");
                } else if (g[1] > 1.2) {
                    $li.addClass("expensive");
                }

                $ul.append($li);
            }
        } else {
            $ul.append($("<li>").text("None"));
        }

        this.showTooltip();
    }

    start(): void {


        var color = d3.scale.category20(), iterations: number = 150;

        var $dl = $("<dl>");
        $dl.append("<dt>Ship</dt>");
        $dl.append(this.$shipmake = $("<dd>").addClass("shipType"));
        $dl.append("<dt>Credits</dt>");
        $dl.append(this.$credits = $("<dd>").addClass("credits"));
        $dl.appendTo(this.$container);

        this.$shipmake.on("mouseover", () => this.showShipTooltip());
        this.$shipmake.on("mouseout", () => this.$tooltip.hide());

        this.svg = d3.select(this.container).append("svg")
            .attr("width", this.graphWidth)
            .attr("height", this.graphHeight);

        this.$tooltip = $("<div>").addClass("planetTooltip");
        this.$tooltip.appendTo(document.body);
        this.$tooltip.hide();

        this.$planetDash = $("<div>").addClass("planetDashboard");
        this.$planetDash.appendTo(this.$container);
        this.$planetDash.hide();

        var force = d3.layout.force()
            .linkDistance(function (d) { return d.value * 10; })
            .size([this.graphWidth, this.graphHeight]);

        d3.json("Content/starchart.json", (error, graph) => {

            if (error) {
                alert(error);
            }

            force
                .charge(-150)
                .nodes(graph.nodes)
                .links(graph.links)
                .start();

            var link = this.svg.selectAll("link")
                .data(graph.links)
                .enter().append("line")
                .attr("class", "link");

            var node = this.svg.selectAll("node")
                .data(graph.nodes)
                .enter().append("circle")
                .attr("class", "node")
                .attr("r", function (d) { return d.radius; })
                .style("fill", function (d) { return color(d.group); })
                .on("mouseover", (d) => this.showPlanetTooltip(d))
                .on("mouseout", (d) => this.$tooltip.hide())
                .on("click", (d) => this.tryMovePlanet(d, force))
                .call(force.drag);

            node.append("title")
                .text(function (d) { return d.name; });

            force.on("tick", function () {
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                node.attr("cx", function (d) { return d.x; })
                    .attr("cy", function (d) { return d.y; });
            });


            for (var i = iterations * iterations; i > 0; --i) force.tick();
            force.stop();

            node.each(d => d.fixed = true);

            this.setRandomPlanet(force.nodes());

        });
    }

}

window.onload = () => {
    var el = document.getElementById('game');

    var game = new GameMain2(el, 640, 300);
    game.start();
}; 