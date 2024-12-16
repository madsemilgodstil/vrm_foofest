"use client";

import { useState, useEffect } from "react";
import Tickets from "@/components/ticket/Ticket";
import Camping from "@/components/camping/Camping";
import Payment from "@/components/payment/Payment";
import Basket from "@/components/basket/Basket";
import Info from "@/components/info/Info";
import useBookingStore from "@/stores/useBookingStore";

const Booking = () => {
  const [currentView, setCurrentView] = useState("tickets");
  const {
    resetBooking,
    resetBasket,
    timer,
    timerActive,
    decrementTimer,
    stopTimer
  } = useBookingStore();

  useEffect(() => {
    resetBasket();
    stopTimer();
  }, [resetBasket, stopTimer]);

  useEffect(() => {
    if (timerActive) {
      const interval = setInterval(() => {
        decrementTimer();
      }, 1000);

      return () => clearInterval(interval);
    }
  }, [timerActive, decrementTimer]);

  useEffect(() => {
    if (timer === 0 && timerActive) {
      alert("Din reservation er udløbet.");
      resetBooking();
      setCurrentView("tickets");
    }
  }, [timer, timerActive, resetBooking]);

  const handleCampingNext = async () => {
    const { campingSelection, tickets, createReservation } =
      useBookingStore.getState();
    const { area } = campingSelection;
    const amount = tickets.reduce(
      (total, ticket) => total + ticket.quantity,
      0
    );

    if (!area || amount === 0) {
      alert("Vælg et område og mindst én billet for at fortsætte.");
      return;
    }

    try {
      const reservationId = await createReservation(area, amount);
      if (reservationId) {
        console.log("Reservation oprettet:", reservationId);
        setCurrentView("info");
      } else {
        alert("Kunne ikke oprette reservation. Prøv igen.");
      }
    } catch (error) {
      console.error("Fejl under oprettelse af reservation:", error);
      alert("Noget gik galt. Prøv igen.");
    }
  };

  return (
    <>
      {timerActive && (
        <div className="sticky top-0 z-50 bg-black text-primary border-b border-t border-primary text-center py-2 mb-8">
          Reservation udløber om: {Math.floor(timer / 60)}:
          {String(timer % 60).padStart(2, "0")}
        </div>
      )}

      <div className="px-4 max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">Booking</h1>

        <div className="grid grid-cols-[65%_30%] justify-between">
          <div className="ticket-selection">
            {currentView === "tickets" && (
              <Tickets onNext={() => setCurrentView("camping")} />
            )}

            {currentView === "camping" && (
              <Camping
                onNext={handleCampingNext}
                onBack={() => setCurrentView("tickets")}
              />
            )}

            {currentView === "info" && (
              <Info
                onNext={() => setCurrentView("payment")}
                onBack={() => setCurrentView("tickets")}
                setCurrentView={setCurrentView}
              />
            )}

            {currentView === "payment" && (
              <Payment
                onBack={() => setCurrentView("info")}
                setCurrentView={setCurrentView}
              />
            )}

            {currentView === "login" && (
              <div>
                <h1>RET DENNE TIL</h1>
              </div>
            )}
          </div>

          <div className="basket-wrapper">
            <Basket />
          </div>
        </div>
      </div>
    </>
  );
};

export default Booking;
