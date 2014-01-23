/**
 * Copyright © 2014 Elastic Path Software Inc. All rights reserved.
 *
 *
 */


var dependencies = config.baseDependencyConfig;
var basePaths = config.baseDependencyConfig.paths;
var extensionPaths = {
  'ext.appheader'         : 'modules/ext/appheader/ext.appheader.controller',
  'ext.appheader.views'   : 'modules/ext/appheader/ext.appheader.views',
  'ext.cart'              : 'modules/ext/cart/ext.cart.controller',
  'ext.cart.views'        : 'modules/ext/cart/ext.cart.views',
  'ext.category'          : 'modules/ext/category/ext.category.controller',
  'ext.category.views'    : 'modules/ext/category/ext.category.views',
  'ext.category.models'   : 'modules/ext/category/ext.category.models',
  'ext.item'              : 'modules/ext/item/ext.item.controller',
  'ext.item.views'        : 'modules/ext/item/ext.item.views',
  'ext.item.models'       : 'modules/ext/item/ext.item.models',
  "ext.purchaseinfo"      : 'modules/ext/purchaseinfo/ext.purchaseinfo.controller'
};

var dependencyPaths = _.extend(basePaths, extensionPaths);
dependencies.paths = dependencyPaths;
require.config(dependencies);

require(['app', 'eventbus', 'i18n', 'bootstrap'],
  function (App, EventBus, i18n) {

    // Application DOM container is ready (viewport)
    $(document).ready(function () {

        // initialize the localization engine
        i18n.init({
            lng: 'en' // default to english
          },
          function () {

            // trigger event to let the application know it is safe to kick off
            EventBus.trigger('app.bootstrapInitSuccess');

          }
        );
      }
    );
  });
