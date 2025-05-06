package main

import (
	"log"
	"github.com/hridaya14/Web-Tech-Project/internal/server"
	"github.com/hridaya14/Web-Tech-Project/pkg/orm"
)

func main() {

	orm.Init()

	server, err := server.CreateServer()

	if err != nil {
		log.Fatal("Unable to start server!")
	}

	if err := server.Run(":5000"); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
	
}
