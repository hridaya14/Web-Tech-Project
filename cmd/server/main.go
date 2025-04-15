package main

import (
	"log"
	"github.com/hridaya14/Web-Tech-Project/internal/server"
	"github.com/hridaya14/Web-Tech-Project/pkg/orm"
)

func main() {

	orm.Init()

	_, err := server.CreateServer()

	if err != nil {
		log.Fatal("Unable to start server!")
	}
	
}
