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

}

class GameMain2 {

    private $container: JQuery;
    private $credits: JQuery;
    private $shipmake: JQuery;
    private $tooltip: JQuery;
    private $planetDash: JQuery;
    private currentPlanet: any;

    private state: GameState = new GameState();


    constructor(private container: HTMLElement, private graphWidth: number, private graphHeight: number) {

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

    playCard(planet: any, type: string, price: number): void {

        var after = $.grep(this.state.cards, (e, i) => e.type !== type);

        if (this.state.cards.length !== after.length + 1) {
            alert("You can't play a card you don't have!");
        }

        this.state.cards = after;
        this.state.credits += price;

        this.setPlanet(planet);

    }

    dealMarketCards(prices): void {

    }

    setPlanet(planet: any): void {

        this.currentPlanet = planet;

        var d = this.$planetDash, $market, $hand, traded: string[] = [], prices: { [id: string]: number; } = {};


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

        this.dealMarketCards(prices);

        if (planet.trade.length == 0) {
            $market.text("There is nothing for sale...");
        }

        if (this.state.cards.length == 0) {
            $hand.text("Your currently don't have any cards");
        } else {
            $.each(this.state.cards, (i, v) => {

                var enable = $.inArray(v.type, traded) != -1 && v.type !== "fuel",
                    card = this.renderCard(v.type, prices[v.type], enable);                

                if (!enable) {
                    card.addClass("disabled");
                } else {
                    card.on("click", () => this.playCard(planet, v.type, prices[v.type]));
                    card.on("mousemove", () => this.showSellTooltip(v.name, prices[v.type]));
                    card.on("mouseout", () => this.$tooltip.hide());
                }

                $hand.append(card);
            });
        }

        d.show();
    }

    setRandomPlanet(planet: any[]) {

        var ix = Math.floor(Math.random() * planet.length);

        this.setPlanet(planet[ix]);

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

        t.show();


    }

    showShipTooltip() {

        var t = this.$tooltip, ship = ships[this.state.shipModel];

        t.empty();
        t.append($("<h2>").text(ship.name));

        t.append($("<div>").html(ship.description).addClass("summary"));

        t.show();

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

        t.show();
    }

    start(): void {


        var color = d3.scale.category20();

        var $dl = $("<dl>");
        $dl.append("<dt>Ship</dt>");
        $dl.append(this.$shipmake = $("<dd>").addClass("shipType"));
        $dl.append("<dt>Credits</dt>");
        $dl.append(this.$credits = $("<dd>").addClass("credits"));
        $dl.appendTo(this.$container);

        this.$shipmake.on("mouseover", () => this.showShipTooltip());
        this.$shipmake.on("mouseout", () => this.$tooltip.hide());

        var svg = d3.select(this.container).append("svg")
            .attr("width", this.graphWidth)
            .attr("height", this.graphHeight);

        this.$tooltip = $("<div>").addClass("planetTooltip");
        this.$tooltip.appendTo(this.$container);
        this.$tooltip.hide();

        this.$planetDash = $("<div>").addClass("planetDashboard");
        this.$planetDash.appendTo(this.$container);
        this.$planetDash.hide();

        var force = d3.layout.force()
            .charge(-120)
            .linkDistance(function (d) { return d.value * 10; })
            .size([this.graphWidth, this.graphHeight]);

        d3.json("Content/starchart.json", (error, graph) => {

            if (error) {
                alert(error);
            }

            force
                .nodes(graph.nodes)
                .links(graph.links)
                .start();

            var link = svg.selectAll("link")
                .data(graph.links)
                .enter().append("line")
                .attr("class", "link");

            var node = svg.selectAll("node")
                .data(graph.nodes)
                .enter().append("circle")
                .attr("class", "node")
                .attr("r", function (d) { return d.radius; })
                .style("fill", function (d) { return color(d.group); })
                .on("mouseover", (d) => this.showPlanetTooltip(d))
                .on("mouseout", (d) => this.$tooltip.hide())
                .on("click", (d) => this.setPlanet(d))
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

            this.setRandomPlanet(force.nodes());

        });
    }

}

window.onload = () => {
    var el = document.getElementById('game');

    var game = new GameMain2(el, 640, 300);
    game.start();
}; 