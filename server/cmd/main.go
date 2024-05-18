package main

import (
	"log"
	"os"
	"server/db"
	"server/internal/user"
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

	router.InitRouter(userHandler)

	router.Start(os.Getenv("PORT"))
}
