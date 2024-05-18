package main

import (
	"log"
	"os"
	"server/db"
	"server/internal/user"
	"server/internal/ws"
	"server/router"
	"server/utils"
)

func main() {
	utils.LoadEnvs()

	dbConn, err := db.NewDatabase()
	if err != nil {
		log.Fatal("could not connect to database: ", err)
	}

	userRep := user.NewRepository(dbConn.GetDB())
	userServ := user.NewService(userRep)
	userHandler := user.NewHandler(userServ)

	hub := ws.NewHub()
	wsHandler := ws.NewHandler(hub)
	go hub.Run()

	router.InitRouter(userHandler, wsHandler)
	router.Start(os.Getenv("PORT"))
}
