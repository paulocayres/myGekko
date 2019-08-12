var _ = require('lodash');
var log = require('../core/log.js');

var myEMA = require('./indicators/myEMA.js');

// configuration
var config = require('../core/util.js').getConfig();
var settings = config.myEMA;
var persistence = settings.persistence;
var fraction = settings.fraction;
var period = settings.period;
var count = period / fraction;
var stop = settings.stop;

//Estatégia com Média movel exponencial.
var strat = {};

// Prepare everything our strat needs
strat.init = function () {

  this.name = 'myEMA';
  this.requiredHistory = config.tradingAdvisor.historySize;

  this.trend = {
    direction: 'none',
    duration: 0,
    persisted: false,
    adviced: false
  };

  this.emaTrend = {
    durationUp: 0,
    durationDown: 0,
    direction: 'none',
    antResult: 0
  }

  // define the indicators we need
  this.addIndicator('myema', 'myEMA', settings);
}

// What happens on every new candle?
/* strat.update = function (candle) {

} */

// For debugging purposes.
strat.log = function () {
  log.debug('In uptrend since', this.trend.duration, 'candle(s)');

}

strat.check = function (candle) {
  //var price = this.lastPrice;
  var ema = this.indicators.myema;
  var result = ema.result;

  if (this.emaTrend.antResult == 0) {
    this.emaTrend.antResult = result;
  }

  //console.log(this.emaTrend.antResult);
  //console.log(result);

  if (this.emaTrend.antResult < result && this.emaTrend.durationUp < count) {
    this.emaTrend.durationUp++;
    if (this.emaTrend.durationUp == this.emaTrend.durationDown) {
      this.emaTrend.durationDown = 0;
    }
    //console.log('somou Up');
  }

  if (this.emaTrend.antResult > result && this.emaTrend.durationDown < count) {
    this.emaTrend.durationDown++;
    if (this.emaTrend.durationUp == this.emaTrend.durationDown) {
      this.emaTrend.durationUp = 0;
    }
    //console.log('somou Down');
  }

  if (this.emaTrend.durationDown > this.emaTrend.durationUp) {
    this.emaTrend.direction = 'Down';
    this.emaTrend.durationDown -= this.emaTrend.durationUp;
    this.emaTrend.durationUp = 0;
    //console.log('setou Down');
  }

  if (this.emaTrend.durationDown < this.emaTrend.durationUp) {
    this.emaTrend.direction = 'Up';
    this.emaTrend.durationUp -= this.emaTrend.durationDown;
    this.emaTrend.durationDown = 0;
    //console.log('setou Up');
  }


  //console.log(this.emaTrend.durationDown);
  //console.log(this.emaTrend.durationUp);
  //console.log(this.emaTrend.direction);


  if (this.emaTrend.direction == 'Up') {


    //console.log('Entrou no Up');

    if (candle.close > result) {

      // new trend detected
      if (this.trend.direction !== 'up')
        // reset the state for the new trend
        this.trend = {
          duration: 0,
          persisted: false,
          direction: 'up',
          adviced: false
        };

      this.trend.duration++;



      if (this.trend.duration >= persistence)
        this.trend.persisted = true;

      if (this.trend.persisted && !this.trend.adviced) {
        this.trend.adviced = true;
        this.advice('long');
/*         this.advice({
          direction: 'long', // or short
          trigger: { // ignored when direction is not "long"
            type: 'trailingStop',
            trailPercentage: 20
            // or:
            // trailValue: 100
          }
        }); */
      } else
        this.advice();

    } else if (candle.close < result) {

      // new trend detected
      if (this.trend.direction !== 'down')
        // reset the state for the new trend
        this.trend = {
          duration: 0,
          persisted: false,
          direction: 'down',
          adviced: false
        };

      this.trend.duration++;



      if (this.trend.duration >= persistence/2)
        this.trend.persisted = true;

      if (this.trend.persisted && !this.trend.adviced) {
        this.trend.adviced = true;
        this.advice('short');
      } else
        this.advice();

    } else {

      log.debug('In no trend');
      this.advice();
    }

  }

  if (this.emaTrend.direction == 'Down') {

    if (candle.close > result) {

      // new trend detected
      if (this.trend.direction !== 'up') {
        // reset the state for the new trend
        this.trend = {
          duration: 0,
          persisted: false,
          direction: 'up',
          adviced: false
        };
      }

      this.trend.duration++;

      log.debug('In uptrend since', this.trend.duration, 'candle(s)');

      if (this.trend.duration >= persistence)
        this.trend.persisted = true;

      if (this.trend.persisted && !this.trend.adviced) {
        this.trend.adviced = true;
        //this.advice('long');
        this.advice({
          direction: 'long', // or short
          trigger: { // ignored when direction is not "long"
            type: 'trailingStop',
            trailPercentage: stop
            // or:
            // trailValue: 100
          }
        });

      } else
        this.advice();

    } else if (candle.close < result) {

      // new trend detected
      if (this.trend.direction !== 'down')
        // reset the state for the new trend
        this.trend = {
          duration: 0,
          persisted: false,
          direction: 'down',
          adviced: false
        };

      this.trend.duration++;



      if (this.trend.duration >= persistence / 2)
        this.trend.persisted = true;

      if (this.trend.persisted && !this.trend.adviced) {
        this.trend.adviced = true;
        this.advice('short');
      } else
        this.advice();

    } else {

      log.debug('In no trend');
      this.advice();
    }

  }

  this.emaTrend.antResult = result;
}
module.exports = strat;
