/**
 * Copyright © 2014 Elastic Path Software Inc. All rights reserved.
 *
 *
 */
define(function (require) {
    var ep = require('ep');
    var Marionette = require('marionette');
    var Backbone = require('backbone');
    var EventBus = require('eventbus');
    var pace = require('pace');
    var ViewHelpers = require('viewHelpers');

    var viewHelpers = ViewHelpers.extend({
      getDisplayType:function(bHasChildren){
        if (bHasChildren){
          return 'inline-block';
        }
        return 'none';
      },
      getAvailabilityDisplayText:function(availability){
        var retVal = '';
        switch(availability){
          case 'AVAILABLE':
            retVal = this.getI18nLabel('availability.AVAILABLE');
            break;
          case 'ALWAYS':
            retVal = this.getI18nLabel('availability.ALWAYS');
            break;
          case 'NOT_AVAILABLE':
            retVal = this.getI18nLabel('availability.NOT_AVAILABLE');
            break;
          case 'AVAILABLE_FOR_BACK_ORDER':
            retVal = this.getI18nLabel('availability.AVAILABLE_FOR_BACK_ORDER');
            break;
          case 'AVAILABLE_FOR_PRE_ORDER':
            retVal = this.getI18nLabel('availability.AVAILABLE_FOR_PRE_ORDER');
            break;
          default:
            retVal = '';
        }
        return retVal;
      },
      getAvailabilityReleaseDate: function (releaseDate) {
        var retVar = '';

        if (releaseDate && releaseDate.displayValue) {
          retVar = releaseDate.displayValue;
        }

        return retVar;
      },
      formatDate: function (releaseDateObj) {
        var retVar = '';

        if (releaseDateObj && releaseDateObj.value) {
          var dateValue = releaseDateObj.value;
          var dateObj = new Date(dateValue);
          retVar = dateObj.toDateString();
        }

        return retVar;
      },
      getListPrice: function (priceObj) {
        var retVar = '';

        if (priceObj) {
          if (priceObj.listed && priceObj.listed.display) {
            retVar = priceObj.listed.display;
          }
        }

        return retVar;
      },
      getPurchasePrice: function (priceObj) {
        var retVar = '';

        if (priceObj) {
          if (priceObj.purchase && priceObj.purchase.amount >= 0) {
            retVar = priceObj.purchase.display;
          }
          else {
            retVar = this.getI18nLabel('itemDetail.noPrice');
          }
        }

        return retVar;
      },
      checkForDisabledAddToCart:function(model){
        // only check for the action link on the form as the
        // determining whether the add to cart button should be active
          // check if add to cart is available
          if (!model.addtocart.actionlink){
            return 'disabled="disabled"';
          }
      },
      getDefaultImagePath:function(thumbnail){
        if (thumbnail && (thumbnail.length > 0)){
          for (var i = 0;i < thumbnail.length;i++){
            if (thumbnail[i].name === 'default-image'){
              return thumbnail[i].absolutePath;
              break;
            }
          }
        }
        else{
          return 'images/img-placeholder.png';
        }
      },
      getDefaultImageName:function(thumbnail){
        var retVar;
        if (thumbnail && thumbnail.name){
          retVar = thumbnail.name;
        }
        else{
          retVar = this.getI18nLabel('itemDetail.noImgLabel');
        }
        return retVar;
      }
    });

    // Default Item Detail Layout
    var extendedLayout = Backbone.Marionette.Layout.extend({
      template:'#ExtItemDetailLayoutTemplate',
      regions:{
        itemDetailTitleRegion:'[data-region="itemDetailTitleRegion"]',
        itemDetailAssetRegion:'[data-region="itemDetailAssetRegion"]',
        itemDetailAttrTitleRegion:'[data-region="itemDetailAttrTitleRegion"]',
        itemDetailAttrContentRegion: '[data-region="itemDetailAttrContentRegion"]',
        itemDetailPriceRegion:'[data-region="itemDetailPriceRegion"]',
        itemDetailAvailabilityRegion:'[data-region="itemDetailAvailabilityRegion"]',
        itemDetailQuantityRegion:'[data-region="itemDetailQuantityRegion"]',
        itemDetailAddToCartRegion:'[data-region="itemDetailAddToCartRegion"]'
      },
      className:'itemdetail-container container'
    });

    // Default Title View
    var defaultItemTitleView = Marionette.ItemView.extend({
      template:'#DefaultItemTitleTemplate',
      onShow:function(){
        pace.stop();
      }
    });

    // Default Asset View
    var defaultItemAssetView = Marionette.ItemView.extend({
      template:'#DefaultItemAssetTemplate',
      className:'itemdetail-asset-container',
      templateHelpers:viewHelpers
    });

    // Default Attribute item View
    var defaultItemAttributeView = Marionette.ItemView.extend({
      template:'#DefaultItemAttributeItemTemplate',
      tagName:'tr'
    });

    // Default Attribute List View
    var defaultItemAttributeListView = Marionette.CollectionView.extend({
      itemView:defaultItemAttributeView,
      tagName:'table',
      className:'table table-striped table-condensed'
    });

    // Extended Item Detail Tab Content View
    var extItemDetailAttrContentView = Backbone.Marionette.ItemView.extend({
      template: '#ExtItemDetailAttrContentTemplate',
      tagName: 'div',
      className: 'tab-pane',
      attributes: function () {
        return {
          id: this.model.attributes.attrKey
        }
      }
    });

    // Extended Item Detail Tab Content Collection View
    var extItemDetailAttrContentCollectionView = Backbone.Marionette.CollectionView.extend({
      itemView: extItemDetailAttrContentView,
      tagName: 'div',
      className: 'tab-content',
      onShow: function () {
        $('.tab-content div').first().addClass('active');
      }
    });

      // Extended Item Detail Tab Title View
    var extItemDetailAttrTitleView = Backbone.Marionette.ItemView.extend({
      template: '#ExtItemDetailAttrTitleTemplate',
      tagName: 'li'
    });

    // Extended Item Detail Tab Title Collection View
    var extItemDetailAttrTitleCollectionView = Backbone.Marionette.CollectionView.extend({
      itemView: extItemDetailAttrTitleView,
      tagName: 'ul',
      className: 'nav nav-tabs',
      onShow: function () {
        $('.nav-tabs li').first().addClass('active');
      }
    });

    // Default Item Availability View
    var defaultItemAvailabilityView = Marionette.ItemView.extend({
      template: '#ExtItemAvailabilityTemplate',
      templateHelpers: viewHelpers,
      tagName: 'ul',
      className: 'itemdetail-availability-container',
      onShow: function () {
        // if no release date, hide dom element with release-date & the label
        if (!viewHelpers.getAvailabilityReleaseDate(this.model.get('releaseDate'))) {
          $('[data-region="itemAvailabilityDescriptionRegion"]', this.$el).addClass('is-hidden');
        }
      }
    });

    //
    // price master view
    //
    var defaultItemPriceView = Marionette.Layout.extend({
      template: '#ItemPriceMasterViewTemplate',
      regions: {
        itemPriceRegion: $('[data-region="itemPriceRegion"]', this.el),
        itemRateRegion: $('[data-region="itemRateRegion"]', this.el)
      },
      onShow: function () {
        // if item has rate, load rate view
        if (this.model.attributes.rateCollection.length > 0) {
          this.itemRateRegion.show(
            new ItemRateCollectionView({
              collection: new Backbone.Collection(this.model.attributes.rateCollection)
            })
          );
        }

        // if item has one-time purchase price, load price view
        if (this.model.get('price').purchase.display) {
          this.itemPriceRegion.show(
            new ItemPriceView({
              model: new Backbone.Model(this.model.attributes.price)
            })
          );
        }

        // no price nor rate scenario is handled at model level
        // an item price object is created with artificial display value
      }
    });

    // Item Price View
    var ItemPriceView = Marionette.ItemView.extend({
      template: '#ItemPriceTemplate',
      templateHelpers: viewHelpers,
      tagName: 'ul',
      className: 'itemdetail-price-container',
      onShow: function () {
        if (!viewHelpers.getListPrice(this.model.attributes)) {
          $('[data-region="itemListPriceRegion"]', this.$el).addClass('is-hidden');
        }
      }
    });

    // Item Rate ItemView
    var itemRateItemView = Marionette.ItemView.extend({
      template: '#ItemRateTemplate',
      templateHelpers: viewHelpers,
      tagName: 'li'
    });

    // Item Rate CollectionView
    var ItemRateCollectionView = Marionette.CollectionView.extend({
      itemView: itemRateItemView,
      tagName: 'ul',
      className: 'itemdetail-rate-container'
    });

    // Default Item Add to Cart View
    var extItemAddToCartView = Marionette.ItemView.extend({
      template:'#ExtItemDetailAddToCartTemplate',
      templateHelpers:viewHelpers,
      events:{
        'click .btn-itemdetail-addtocart':function(event){
          event.preventDefault();
          EventBus.trigger('item.addToCartBtnClicked',event);
        }
      }
    });

    function getAddToCartQuantity(){

      return $('#itemdetail-select-quantity').val() || 0;
    }

    return {
      DefaultView:extendedLayout,
      DefaultItemTitleView:defaultItemTitleView,
      DefaultItemAssetView:defaultItemAssetView,
      DefaultItemAvailabilityView:defaultItemAvailabilityView,
      DefaultItemPriceView:defaultItemPriceView,
      DefaultItemAddToCartView:extItemAddToCartView,
      ExtItemDetailAttrTitleCollectionView:extItemDetailAttrTitleCollectionView,
      ExtItemDetailAttrContentCollectionView:extItemDetailAttrContentCollectionView,
      getAddToCartQuantity:getAddToCartQuantity
    };
  }
);
