/**
 * Copyright © 2014 Elastic Path Software Inc. All rights reserved.
 *
 *
 */
define(function (require) {
    var App = require('app'),
        ep = require('ep'),
        EventBus = require('eventbus'),
        pace = require('pace'),
        Model = require('ext.category.models'),
        View = require('ext.category.views'),
        template = require('text!modules/base/category/base.category.templates.html'),
        extTemplate = require('text!modules/ext/category/ext.category.templates.html');

    $('#TemplateContainer').append(template);
    $('#TemplateContainer').append(extTemplate);
    _.templateSettings.variable = 'E';

    /*
     *
     * DEFAULT VIEW
     *
     *
     */
    var defaultView = function (hrefObj) {
      pace.start();
      var categoryLayout = new View.DefaultView();
      var categoryModel = new Model.CategoryModel();


      var href = hrefObj.href;
      var pageHref = hrefObj.pageHref;

      categoryModel.fetch({
        url: categoryModel.getUrl(href),
        success: function (response) {
          categoryLayout.categoryTitleRegion.show(
            new View.CategoryTitleView({
              model: categoryModel
            })
          );

          if (!pageHref) {
            pageHref = response.get('itemLink');
          }

          var reqObj = {
            fetchHref: pageHref,
            categoryHref: response.get('href')
          };

          EventBus.trigger('category.fetchCategoryItemPageModelRequest', reqObj);

        },
        error: function (response) {
          ep.logger.error('error fetch category model ' + response);
        }
      });


      return categoryLayout;
    };


    /*
     *
     *
     * EVENT LISTENERS
     *
     *
     */
    EventBus.on('category.fetchCategoryItemPageModelRequest', function (reqObj) {
      pace.start();
      var categoryItemModel = new Model.CategoryItemPageModel();
      categoryItemModel.fetch({
        url: categoryItemModel.getUrl(reqObj.fetchHref),
        success: function (itemResponse) {
          var paginationModel = new Model.CategoryPaginationModel(itemResponse.get('pagination'));
          paginationModel.set('categoryHref', reqObj.categoryHref);

          var paginationTopView = new View.CategoryPaginationView({
            model: paginationModel
          });
          var paginationBottomView = new View.CategoryPaginationView({
            model: paginationModel
          });

          ep.app.categoryPaginationTopRegion.show(paginationTopView);
          ep.app.categoryPaginationBottomRegion.show(paginationBottomView);
          ep.app.categoryBrowseRegion.show(
            new View.CategoryItemCollectionView({
              collection: new Model.CategoryItemCollectionModel(itemResponse.attributes.itemCollection)
            })
          );
        },
        error: function (response) {
          ep.logger.error('error fetch category items model ' + response);
        }
      });
    });

    // pagination btn is clicked
    EventBus.on('category.paginationBtnClicked', function (direction, link) {
      ep.logger.info(direction + ' btn clicked.');

      EventBus.trigger('category.reloadCategoryViewsRequest', link);

    });

    // Hide pagination regions when empty collection rendered
    EventBus.on('category.emptyCollectionRendered', function () {
      View.HidePaginationRegion();
      pace.stop();
    });

    /* ************** ADD TO CART EVENT LISTENER ***************** */
    var submitAddToCartForm = function (formDataObj) {
      var formActionLink = formDataObj.actionLink;
      var qty = formDataObj.qty;

      if (formActionLink) {
        if (qty > 0) {

          var obj = '{quantity:' + qty + '}';
          ep.io.ajax({
            type: 'POST',
            contentType: 'application/json',
            url: formActionLink,
            data: obj,
            success: function (response, x, y) {
              // follow link response
              ep.logger.info('Success posting to cart - go to cart view');

              // get the location header
              ep.logger.info(response);
              // ep.logger.info(request);
              ep.logger.info(JSON.stringify(y));
              var lineItemUrl = y.getResponseHeader('Location');
              ep.logger.info(lineItemUrl);
              if (lineItemUrl) {
                EventBus.trigger('category.loadDefaultCartRequest');
              }
              else {
                ep.logger.warn('add to cart success but no cart url returned');
              }


              ep.logger.info('we are done load the cart view');


            },
            error: function (response) {
              ep.logger.error('error posting item to cart: ' + response);
            }
          });

        }
        else {
          ep.logger.warn('add to cart called with no quantity');
        }

      }
    };

    EventBus.on('category.addToCartBtnClicked', function (formDataObj) {
      EventBus.trigger('category.submitAddToCartFormRequest', formDataObj);
    });

    EventBus.on('category.submitAddToCartFormRequest', submitAddToCartForm);

    EventBus.on('category.loadDefaultCartRequest', function () {
      ep.router.navigate(ep.app.config.routes.cart, true);
    });

    return {
      DefaultView: defaultView
    };
  }
);
