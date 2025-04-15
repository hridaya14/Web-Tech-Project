package server

import (
	"github.com/gin-gonic/gin"
)

func CreateServer() (*gin.Engine, error) {

	router := gin.Default()

	_,err := registerRoutes(router)	

	if err != nil {
		return nil, err
	}

	router.Run(":8000")
	return router, nil


	
}
