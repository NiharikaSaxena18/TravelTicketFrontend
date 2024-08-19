document.addEventListener("DOMContentLoaded", function () {
  checkLoggedIn();
});

// Fetch token from cookies
const token = Cookies.get("token");

//checking user logged in or not
async function checkLoggedIn() {
  try {
    const response = await axios.get(
      "https://travel-ticket-backend.onrender.com/api/verifytoken",
      {
        headers: {
          token,
        },
      }
    );

    if (response.data.loggedIn) {
      // Show logged in UI elements
      document.querySelectorAll("[id='logout-btn']").forEach((element) => {
        element.style.display = "block";
      });
      document.querySelectorAll("[id='profile']").forEach((element) => {
        element.style.display = "block";
      });
      document.querySelectorAll("[id='login-btn']").forEach((element) => {
        element.style.display = "none";
      });
    } else {
      // Show logged out UI elements
      document.querySelectorAll("[id='logout-btn']").forEach((element) => {
        element.style.display = "none";
      });
      document.querySelectorAll("[id='profile']").forEach((element) => {
        element.style.display = "none";
      });
      document.querySelectorAll("[id='login-btn']").forEach((element) => {
        element.style.display = "block";
      });
    }
  } catch (error) {
    console.log(error);
    // Show error message or logged out UI elements
    document.querySelectorAll("[id='logout-btn']").forEach((element) => {
      element.style.display = "none";
    });
    document.querySelectorAll("[id='profile']").forEach((element) => {
      element.style.display = "none";
    });
    document.querySelectorAll("[id='login-btn']").forEach((element) => {
      element.style.display = "block";
    });
  }
}

document.querySelectorAll("[id='logout-btn']").forEach((element) => {
  element.addEventListener("click", () => {
    if (Cookies.get("token")) {
      Cookies.remove("token");
      console.log("removed");
    }
    window.location.href = "../../index.html";
    document.querySelectorAll("[id='logout-btn']").forEach((element) => {
      element.style.display = "none";
    });
    document.querySelectorAll("[id='profile']").forEach((element) => {
      element.style.display = "none";
    });
    document.querySelectorAll("[id='login-btn']").forEach((element) => {
      element.style.display = "block";
    });
  });
});

//navbar
function showSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.add("show");
  const body = document.querySelector(".body");
  body.style.overflow = "hidden";
  document.querySelectorAll("hideonMobile").forEach((element) => {
    element.style.display = "none";
  });
}

function hideSidebar() {
  const sidebar = document.querySelector(".sidebar");
  sidebar.classList.remove("show");
  const body = document.querySelector(".body");
  body.style.overflow = "";
}

if (!token) {
  // redirect to login page
  alert("Please Login First");
  window.location.href = "./login.html";
} else {
  document.getElementById("cont").style.display = "block";
  const fetchUserDetails = async () => {
    try {
      const response = await axios.post(
        "https://travel-ticket-backend.onrender.com/api/user/details",
        {},
        { headers: { token } }
      );
      const { name, email } = response.data;
      document.getElementById("user-name").textContent = name;
      document.getElementById("user-email").textContent = email;
    } catch (error) {
      console.error("Error fetching user details:", error);
    }
  };

  const fetchTickets = async () => {
    try {
      const response = await axios.post(
        "https://travel-ticket-backend.onrender.com/api/checkout/booked",
        {},
        { headers: { token } }
      );

      const tickets = response.data.data;
      const ticketContainer = document.querySelector(
        ".order-details-container"
      );

      tickets.forEach((ticket, index) => {
        const ticketDiv = document.createElement("div");
        ticketDiv.classList.add("order-details");

        // Convert date to local time
        const date = new Date(ticket.date);
        const localDate = date.toLocaleString();
        const startDate = new Date(ticket.travelDates.startDate)
          .toLocaleString()
          .slice(0, 9);
        const endDate = new Date(ticket.travelDates.endDate)
          .toLocaleString()
          .slice(0, 9);

        const ticketHTML = `
        <h2>Order ${index + 1}</h2>
        <p><strong>Booking ID:</strong> ${ticket._id}</p>
        <p><strong>Booking Address:</strong> ${ticket.address}</p>
        <p><strong>Booking Date:</strong> ${localDate}</p>
        <p><strong>Destination :</strong> ${ticket.location}</p>
        <p><strong>Travel Dates:</strong> ${startDate} TO ${endDate}</p>
        <p><strong>Total Cost: &#8377; ${ticket.amount}</strong></p>
        <button class="download-btn" onclick="generatePDF(${index}, '${startDate}', '${endDate}')">Download Confirmation</button>
      `;
        ticketDiv.innerHTML = ticketHTML;

        ticketContainer.appendChild(ticketDiv);
      });
    } catch (error) {
      console.error("Error fetching tickets:", error);
    }
  };

  fetchUserDetails();
  fetchTickets();

  function generatePDF(index, startDate, endDate) {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    // Get all order details
    const orders = document.querySelectorAll(".order-details");
    const order = orders[index];
    // const ordersArray = Array.from(orders);

    // Create a title page
    doc.setFontSize(22);
    doc.setTextColor(40);
    doc.text("TravelToor Booking Confirmation", 80, 30);

    // Add a horizontal line
    doc.setLineWidth(0.5);
    doc.line(20, 35, 190, 35);

    // Loop through each order and add its details to the PDF
    const orderDetails = {
      customerName: document.getElementById("user-name").textContent,
      bookingID: order
        .querySelector("p:nth-child(2)")
        .textContent.split(": ")[1],
      destination: order
        .querySelector("p:nth-child(5)")
        .textContent.split(": ")[1],
      travelDates: `${startDate} - ${endDate}`,
      bookingDate: order
        .querySelector("p:nth-child(4)")
        .textContent.split(": ")[1],
      totalCost: order
        .querySelector("p:nth-child(7)")
        .textContent.split(": ")[1]
        .replace("₹", "")
        .trim(),
    };

    // Add order details as a table
    const tableColumn = ["Field", "Details"];
    const tableRows = [
      ["Customer Name", orderDetails.customerName],
      ["Booking ID", orderDetails.bookingID],
      ["Destination", orderDetails.destination],
      ["Travel Dates", orderDetails.travelDates],
      ["Booking Date", orderDetails.bookingDate],
      ["Total Cost", orderDetails.totalCost],
    ];

    doc.autoTable({
      startY: 40,
      head: [tableColumn],
      body: tableRows,
      theme: "grid",
      styles: { fontSize: 12 },
      headStyles: { fillColor: [60, 141, 188] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    });

    // Add footer
    const finalY = doc.lastAutoTable.finalY + 10;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text("Thank you for booking with TravelToor!", 20, finalY);
    doc.text(
      "For any inquiries, please contact support@traveltoor.com",
      20,
      finalY + 10
    );

    // Save the PDF
    doc.save(`TravelToor_Booking_Confirmation_${index}.pdf`);

    // Add download confirmation
    const downloadConfirmation = document.createElement("div");
    downloadConfirmation.classList.add("download-confirmation");
    downloadConfirmation.textContent =
      "Your booking confirmation has been downloaded successfully!";
    document.body.appendChild(downloadConfirmation);

    // Remove download confirmation after 5 seconds
    setTimeout(() => {
      downloadConfirmation.remove();
    }, 5000);
  }
}
