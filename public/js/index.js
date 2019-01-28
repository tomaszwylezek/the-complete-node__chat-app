const socket = io();

socket.on("connect", function() {
  console.log("Connected to server");
});

socket.on("disconnect", function() {
  console.log("Disconnected from server");
});

socket.on("newMessage", function(message) {
  const formattedTime = moment(message.createdAt).format("h:mm a");
  const template = $("#message-template").html();

  const html = Mustache.render(template, {
    text: message.text,
    from: message.from,
    createdAt: formattedTime
  });

  $("#messages").append(html);
});

socket.on("newLocationMessage", function(message) {
  const formattedTime = moment(message.createdAt).format("h:mm a");
  const template = $("#location-message-template").html();
  const html = Mustache.render(template, {
    url: message.url,
    from: message.from,
    createdAt: formattedTime
  });

  $("#messages").append(html);
});

jQuery("#message-form").on("submit", function(e) {
  e.preventDefault();

  const messageTextbox = jQuery("[name=message]");

  socket.emit(
    "createMessage",
    {
      from: "User",
      text: messageTextbox.val()
    },
    function() {
      messageTextbox.val("");
    }
  );
});

const locationButton = jQuery("#send-location");

locationButton.on("click", function() {
  if (!navigator.geolocation) {
    return alert("Geolocation not supported by your browser.");
  }

  locationButton.attr("disabled", "disabled").text("Sending location...");

  navigator.geolocation.getCurrentPosition(
    function(position) {
      locationButton.removeAttr("disabled").text("Send location");
      socket.emit("createLocationMessage", {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      });
    },
    function() {
      locationButton.removeAttr("disabled").text("Send location");
      alert("Unable to fetch location.");
    }
  );
});
