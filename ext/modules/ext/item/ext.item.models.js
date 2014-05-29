/**
 * Copyright © 2014 Elastic Path Software Inc. All rights reserved.
 *
 */
define(function (require) {
  var ep = require('ep');
  var Backbone = require('backbone');
  var ModelHelper = require('modelHelpers');

    var zoomArray = [
      'availability',
      'addtocartform',
      'price',
      'rate',
      'definition',
      'definition:assets:element'
    ];

    var itemModel = Backbone.Model.extend({
      getUrl: function (href) {
        return ep.ui.decodeUri(href) + '?zoom=' + zoomArray.join();
      },
      parse: function (item) {


        var itemObj = {};


        /*
         *
         * Display Name
         *
         * */
        itemObj.displayName = jsonPath(item, "$.['_definition'][0]['display-name']")[0];
        //itemObj.displayName = item['_definition'][0]['display-name'];

        /*
         *
         * Details
         *
         * */
        itemObj.details = [];
        var longDesc = {
          index: 0,
          key: 'longDesc'
        };
        var features = {
          index: 1,
          key: 'features'
        };
        var sysRequirement = {
          index: 2,
          key: 'system_requirements'
        };

        var attributesArray = [];
        var attrArrayLen = 0;
        var rawAttributes = jsonPath(item, "$.'_definition'..'details'")[0];

        if (rawAttributes) {
          attrArrayLen = rawAttributes.length;
        }

        for (var x = 0; x < attrArrayLen; x++) {
          var currObj = rawAttributes[x];
          var attrKey = jsonPath(currObj, 'name');

          if (longDesc.key == attrKey) {
            addAttributeToList(attributesArray, currObj, longDesc.index);
          }

          if (features.key == attrKey) {
            addAttributeToList(attributesArray, currObj, features.index);
          }
          if (sysRequirement.key == attrKey) {
            addAttributeToList(attributesArray, currObj, sysRequirement.index);
          }
        }

        if (attributesArray.length == 0) {
          attributesArray = [
            {
              attrKey: 'longDesc',
              displayName: 'Details',
              displayValue: 'No Description Available.'
            }
          ];

        }
        itemObj.details = attributesArray;

        /*
         *
         * Add to Cart Action test
         *
         * */
        itemObj.addtocart = {};
        itemObj.addtocart.actionlink = null;
        var addToCartFormAction = jsonPath(item, "$._addtocartform..links[?(@.rel='addtodefaultcartaction')].rel")[0];
        if (addToCartFormAction) {
          itemObj.addtocart.actionlink = jsonPath(item, "$._addtocartform..links[?(@.rel='addtodefaultcartaction')].href")[0];
        }


        /*
         *
         * Assets
         *
         * */
        itemObj.asset = {};
        itemObj.asset.url = '';
        var assetsListArray = [];
        var assetsArray = jsonPath(item, "$._definition.._assets.._element")[0];
        if (assetsArray) {
          var defaultImage = jsonPath(item, "$._definition.._assets.._element[?(@.name='default-image')]")[0];
          var assetObj = {};

          //itemObj.asset.url = 'http://localhost:3007/images/testdata/finding-nemo.jpg';
          //itemObj.asset.url = defaultImage['content-location'];
          assetObj.absolutePath = defaultImage['content-location'];
          assetObj.name = defaultImage.name;
          assetObj.relativePath = defaultImage['relative-location'];
          assetsListArray.push(assetObj);
        }

        itemObj.assets = assetsListArray;

        /*
         *
         * Availability
         *
         * */
        var availabilityObj = jsonPath(item, '$._availability')[0];
        if (availabilityObj) {
          itemObj.availability = modelHelpers.parseAvailability(availabilityObj);
        }


        /*
         *
         * Price
         *
         * */
        itemObj.price = {};
        itemObj.price.listed = {};
        itemObj.price.purchase = {};
        itemObj.rateCollection = [];

        var purchasePriceObject = jsonPath(item, '$._price..purchase-price[0]')[0];
        if (purchasePriceObject) {
          itemObj.price.purchase = modelHelpers.parsePrice(purchasePriceObject);
        }

        var listPriceObject = jsonPath(item, '$._price..list-price[0]')[0];
        if (listPriceObject) {
          itemObj.price.listed = modelHelpers.parseListPrice(listPriceObject, itemObj.price.purchase);
        }

        var rates = jsonPath(item, '$._rate..rate')[0];
        itemObj.rateCollection = parseRates(rates);


        // fake a price object when neither rate nor price present
        if (!purchasePriceObject && itemObj.rateCollection.length === 0) {
          itemObj.price.purchase = {
            display: 'none'
          };
        }

        return itemObj;
      },
      getDefaultImage: function () {
        var retVal = null;
        if (this.attributes.assets && (this.attributes.assets.length > 0)) {
          for (var i = 0; i < this.attributes.assets.length; i++) {
            if (this.attributes.assets[i].name === 'default-image') {
              retVal = this.attributes.assets[i];
              break;
            }
          }
        }
        return retVal;
      },
      isAddToCartEnabled: function () {
        var retVal = false;
        if (this.attributes.addtocart) {
          if (this.attributes.addtocart.actionlink) {
            return true;
          }
        }
        return retVal;
      }
    });

    var itemAttributeModel = Backbone.Model.extend();
    var itemAttributeCollection = Backbone.Collection.extend({
      model: itemAttributeModel,
      parse: function (collection) {
        return collection;
      }
    });

    var listPriceModel = Backbone.Model.extend();




  var modelHelpers = ModelHelper.extend({});

    // function to parse rates collection
    var parseRates = function (rates) {
      var ratesArrayLen = 0;
      var rateCollection = [];

      if (rates) {
        ratesArrayLen = rates.length;
      }

      for (var i = 0; i < ratesArrayLen; i++) {
        var rateObj = {};

        rateObj.display = rates[i].display;
        rateObj.cost = {
          amount: jsonPath(rates[i], '$.cost..amount')[0],
          currency: jsonPath(rates[i], '$.cost..currency')[0],
          display: jsonPath(rates[i], '$.cost..display')[0]
        };

        rateObj.recurrence = {
          interval: jsonPath(rates[i], '$.recurrence..interval')[0],
          display: jsonPath(rates[i], '$.recurrence..display')[0]
        };

        rateCollection.push(rateObj);
      }

      return rateCollection;
    };

    var addAttributeToList = function (list, rawObj, insertIndex) {
      var attributeObj = {
        attrKey: jsonPath(rawObj, 'name'),
        displayName: jsonPath(rawObj, 'display-name'),
        displayValue: jsonPath(rawObj, 'display-value')
      }

      list.splice(insertIndex, 0, attributeObj);
    };

    // Required, return the module for AMD compliance
    return {
      ItemModel: itemModel,
      ItemAttributeCollection: itemAttributeCollection,
      ListPriceModel: listPriceModel
    };
  });

