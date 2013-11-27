/**
 * Copyright Elastic Path Software 2013.

 * User: sbrookes
 * Date: 04/04/13
 * Time: 9:16 AM
 *
 * 
 */
define(['ep','app', 'eventbus', 'cortex', 'profile.models', 'ext.profile.views', 'text!modules/ext/profile/ext.profile.templates.html', 'text!modules/base/profile/base.profile.templates.html'],
  function(ep, App, EventBus, Cortex, Model, View, template, baseTemplate){

    $('#TemplateContainer').append(template);
    $('#TemplateContainer').append(baseTemplate);

    _.templateSettings.variable = 'E';

    var defaultView = function(){

      // ensure the user is authenticated befor continuing to process the request
      if(ep.app.isUserLoggedIn()){
        var defaultLayout = new View.DefaultLayout();

        var profileModel = new Model.ProfileModel();

        var profileSummaryRegion = new Marionette.Region({
          el:'[data-region="profileSummaryRegion"]'
        });
        var profilePaymentMethodsRegion = new Marionette.Region({
          el:'[data-region="profilePaymentMethodsRegion"]'
        });
        var profileSubscriptionSummaryRegion = new Marionette.Region({
          el:'[data-region="profileSubscriptionSummaryRegion"]'
        });
        var profileSummaryView = new View.ProfileSummaryView({
          model:profileModel
        });
        var profileTitleView =new View.ProfileTitleView({});


        profileModel.fetch({
          success:function(response){
            // Profile Title

            defaultLayout.profileTitleRegion.show(profileTitleView);

            // Profile Summary
            profileSummaryRegion.show(profileSummaryView);

            // Profile Subscriptions
            var profileSubs = profileModel.get('subscriptions');
            if (profileSubs){
              profileSubscriptionSummaryRegion.show( new View.ProfileSubscriptionSummaryView({
                collection:new Backbone.Collection(profileModel.get('subscriptions'))
              }));
            }

            // Profile Payment Methods
            profilePaymentMethodsRegion.show( new View.PaymentMethodsView({
              collection:new Backbone.Collection(profileModel.get('paymentMethods'))
            }));

          },
          error:function(response){
            ep.logger.error('Error getting profile subscription model');
          }
        });

        return defaultLayout;
      }
      else{
        EventBus.trigger('layout.loadRegionContentRequest', {
          region: 'appModalRegion',
          module: 'auth',
          view: 'LoginFormView'
        });
      }



    };



    return {
      DefaultView:defaultView

    };
  }
);