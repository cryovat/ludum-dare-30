/// <reference path="starfield.ts" />

class Ship {

    constructor(public name: string, public capacity: number, public description: string) {

    }

}

var ships: { [id: string]: Ship } = {
    "shuttle": new Ship("MK I Shuttlecraft", 6, "The shuttles were never known for their elegance or defensive ability, but they're reliable and often the only thing an independent trader can afford. <strong>The shuttle can hold six items.</strong>")
};

class Card {

    constructor(public type: string, public name: string, public price: number) {

    }
}

var cards: { [id: string]: Card } = {};

var addCard = (card: Card) => {
    cards[card.type] = card;
};

addCard(new Card("fuel", "Fuel", 35));
addCard(new Card("food", "Food", 100));
addCard(new Card("ore", "Ore", 100));
addCard(new Card("medicine", "Medicine", 200));
addCard(new Card("luxury", "Luxury goods", 500));
addCard(new Card("xxx", "Collectible", 100));
addCard(new Card("tech", "Technology", 500));

class GameState {
    public market: Card[] = [];
    public cards: Card[] = [];
    public credits: number;
    public shipModel: string;

    public alive: boolean = true;

    constructor() {

        this.cards.push(cards["fuel"]);
        this.cards.push(cards["fuel"]);
        this.cards.push(cards["food"]);

        this.credits = 200;
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
    private lineH: D3.Selection;
    private lineV: D3.Selection;
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

        if (!this.state.alive) {

            if (this.state.credits > 10000) {
                alert("You don't need to travel anymore. These days you hire other people to travel for you while you count your money.");
            } else {
                alert("You failed to make it as an interstellar trader.");
            }

            return;
        }

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
    }

    setCrosshair(planet: any) {

        var x = Math.floor(planet.x),
            y = Math.floor(planet.y);

        this.lineH
            .attr("x1", 0)
            .attr("y1", y)
            .attr("x2", this.graphWidth)
            .attr("y2", y);

        this.lineV
            .attr("x1", x)
            .attr("y1", 0)
            .attr("x2", x)
            .attr("y2", this.graphHeight);

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

        this.setCrosshair(planet);

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

                if (v.type === "fuel") {
                    card.on("mousemove", () => this.showFuelTooltip());
                } else {
                    card.on("mousemove", () => this.showNotAcceptedTooltip());
                }

            } else {

                sellable += prices[v.type];

                card.on("click", () => this.playCard(planet, v.type, prices[v.type]));
                card.on("mousemove", () => this.showSellTooltip(v.name, prices[v.type]));
            }

            card.on("mouseout", () => this.$tooltip.hide());

            $hand.append(card);

            cardCount++;

        });

        $.each(state.market, (i, v) => {

            var playerHandFull = state.cards.length >= ships[state.shipModel].capacity,
                enable = prices[v.type] <= state.credits && !playerHandFull,
                card = this.renderCard(v.type, prices[v.type], enable);

            if (!enable) {
                card.addClass("disabled");

                if (playerHandFull) {
                    card.on("mousemove", () => this.showHandFullTooltip());
                } else {
                    card.on("mousemove", () => this.showTooExpensiveTooltip());
                }

            } else {
                card.on("click", () => this.buyCard(planet, v.type, prices[v.type]));
                card.on("mousemove", () => this.showBuyTooltip(v.name, prices[v.type]));
            }

            card.on("mouseout", () => this.$tooltip.hide());

            $market.append(card);

        });

        while (cardCount < ships[this.state.shipModel].capacity) {
            $hand.append($("<span>").html("&nbsp").addClass("cardPlaceholder"));
            cardCount++;
        }


        if (this.state.credits > 10000) {

            d.empty();

            this.state.alive = false;

            this.showVictory();

        } else if (!this.state.hasFuel() && (!prices["fuel"] || prices["fuel"] > (this.state.credits + sellable))) {

            d.empty();

            this.state.alive = false;

            this.showGameOver();
        }
        else {
            d.show();
        }
    }

    showGameOver() {


        this.$planetDash.hide();

        var $gameOver = $("<div>").addClass("gameover");
        $gameOver.append($("<h2>").text("Game Over"));
        $gameOver.hide();

        this.$container.append($gameOver);

        alert("You've run out of fuel and money. Disillusioned, you sell your spaceship and try to pay your debts by taking work in a local mine. You toil away your years and never set foot in space again.");

        $gameOver.fadeIn(1000);

    }

    showVictory() {

        this.$planetDash.hide();

        var $gameOver = $("<div>").addClass("victory");
        $gameOver.append($("<h2>").text("You win"));
        $gameOver.hide();

        this.$container.append($gameOver);

        alert("Amassing so much money has made you wary of space travel, and you decide to retire to a peaceful life of eating caviar and counting money. Congratulations, you win!");

        $gameOver.fadeIn(1000);

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

    showNotAcceptedTooltip() {

        var t = this.$tooltip, $summary;

        t.empty();
        t.append($("<h2>").text("Item not traded"));

        t.append($summary = $("<div>").addClass("summary"));

        t.append("The are no local traders that buy this type of item.");

        this.showTooltip();

    }

    showFuelTooltip() {

        var t = this.$tooltip, $summary;

        t.empty();
        t.append($("<h2>").text("Fuel card"));

        t.append($summary = $("<div>").addClass("summary"));

        t.append("Fuel cards are spent automatically when moving between systems.");

        this.showTooltip();
    }

    showTooExpensiveTooltip() {

        var t = this.$tooltip, $summary;

        t.empty();
        t.append($("<h2>").text("Card too expensive"));

        t.append($summary = $("<div>").addClass("summary"));

        t.append("You don't have enough credits to buy this card.");

        this.showTooltip();
    }

    showHandFullTooltip() {

        var t = this.$tooltip, $summary;

        t.empty();
        t.append($("<h2>").text("Hand full"));

        t.append($summary = $("<div>").addClass("summary"));

        t.append("Your hand is full. To buy this card, sell a commodity or travel to spend a fuel card.");

        this.showTooltip();
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

        if (planet["trade"] && planet.trade.length > 0) {

            for (i in planet.trade) {
                g = planet.trade[i];

                $li = $("<li>").text(cards[g[0]].name);

                if (g[1] <= 0.7) {
                    $li.addClass("cheap");
                } else if (g[1] > 6) {
                    $li.addClass("legendary");
                } else if (g[1] > 1.3) {
                    $li.addClass("premium");
                } else if (g[1] > 1) {
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


        var color = d3.scale.category20(), iterations: number = 170;

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

        this.lineH = this.svg
            .append("line")
            .attr("class", "crosshair");

        this.lineV = this.svg
            .append("line")
            .attr("class", "crosshair");

        this.$tooltip = $("<div>").addClass("planetTooltip");
        this.$tooltip.appendTo(document.body);
        this.$tooltip.hide();

        this.$planetDash = $("<div>").addClass("planetDashboard");
        this.$planetDash.appendTo(this.$container);
        this.$planetDash.hide();

        var force = d3.layout.force()
            .linkDistance(function (d) { return d.value * 13; })
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

            var gnodes = this.svg.selectAll("g.gnode")
                .data(graph.nodes)
                .enter()
                .append("g")
                .classed("gnode", true);

            var node =
                gnodes.append("circle")
                    .attr("class", (d) => "node " + d.name.toLowerCase())
                    .attr("r", function (d) { return d.radius; })
                    .style("fill", function (d) { return color(d.group); })
                    .on("mouseover", (d) => this.showPlanetTooltip(d))
                    .on("mouseout", (d) => this.$tooltip.hide())
                    .on("click", (d) => this.tryMovePlanet(d, force))
                    .call(force.drag);

            gnodes.append("text")
                .attr("class", "planetLabel")
                .attr("x", (d) => d.radius + 5)
                .text(function (d) { return d.short; });

            node.append("title")
                .text(function (d) { return d.name; });

            force.on("tick", function () {
                link.attr("x1", function (d) { return d.source.x; })
                    .attr("y1", function (d) { return d.source.y; })
                    .attr("x2", function (d) { return d.target.x; })
                    .attr("y2", function (d) { return d.target.y; });

                gnodes.attr("transform", function (d) {
                    return 'translate(' + [d.x, d.y] + ')';
                });
            });

            for (var i = iterations * iterations; i > 0; --i) force.tick();
            force.stop();

            node.each(d => d.fixed = true);

            this.setRandomPlanet(force.nodes());

        });
    }

}

function fixHeight() {
    if (window.innerHeight < 700) {
        $("header").hide();
    } else {
        $("header").show();
    }
}

window.addEventListener("resize", () => {
    fixHeight();
});

window.onload = () => {


    var starfield = new Starfield(document);
    var el = document.getElementById('game');

    var game = new GameMain2(el, 640, 270);
    game.start();

    fixHeight();


}; 