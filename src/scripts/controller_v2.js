var controller = (function($) {
  var self = this;
  var wwClient = qmatic.webwidget.client;
  var wwRest = qmatic.connector.client;

  function fillStaffData (staffData, button) {
    makeOpen();
    const worstationEl = $('.workstation');

    if(staffData.name) {
      $('.workstation').html(staffData.name);
      
      $('.staff-buttons-container').click(function() {
        const VIPLevel = staffData.name.match(/\d+$/)[0];
        handleClick(VIPLevel, button);
      });
    }
  }

  function makeOpen() {
    $('.staff-info').removeClass('closed');
    $('#icon-img').attr('src', 'images/check.png');
    $('.staff-profile').removeClass('closed');
  }

  function makeClosed() {
    $('.staff-info').addClass('closed');
    $('.staff-profile').addClass('closed');
    $('#icon-img').attr('src', 'images/cross.png');
    $('.staff-buttons-container').unbind( "click" );;
    const staffLastName = $('#last-name').text();

    if(/ová$/.test(staffLastName)) {
      $('.workstation').html('Neprítomná.');
    } else {
      $('.workstation').html('Neprítomný.');
    }
  }

  function handleClick(VIPLevel, button) {
    var btn =  parent.document.getElementById(button);
      
    wwClient.putDataIntoAppCache("level","VIP Level " + VIPLevel);

    setTimeout(function() {
      $(btn).click();
      wwClient.clearCache();
    }, 500);
    
  }

  function initializeWidget(lastName, button) {
    const branchId = wwClient.getBranchId();
    const servicePointMI = wwRest.getServicePointData(branchId);
    
    if(servicePointMI) {
      
      var servicePointForStaff = null;

      for (var i= 0; i < servicePointMI.length; i++) {
        var fullName = servicePointMI[i].staffFullName;
        if(fullName !== null) {
          if(fullName.indexOf(lastName) !== -1) {
            servicePointForStaff = servicePointMI[i];
          }
        }
      }

      if(servicePointForStaff) {
        fillStaffData(servicePointForStaff, button);
      } else {
        makeClosed();
      }
    }
  }

  return {
    onLoaded: function(configuration) {
      var attr = configuration.attributes;
      var attribParser = new qmatic.webwidget.AttributeParser(attr || {});

      const firstName = attribParser.getString('first_name');
      const lastName = attribParser.getString('last_name');
      const button = attribParser.getString('service_button');
      const imageSrc =  attribParser.getImageUrl('profile');

      if(imageSrc) {
        $('.staff-profile img').attr('src', imageSrc);
      }
      
      document.getElementById('first-name').innerText = firstName;
      document.getElementById('last-name').innerText = lastName;

      initializeWidget(lastName, button);
      setInterval(function () {
        initializeWidget(lastName, button);
      }, 50000);
    },

    onLoadError: function(message) {
      console.error(message);
    }
  };
  
})(jQuery);
