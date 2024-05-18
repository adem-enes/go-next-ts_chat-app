package ws

import (
	"net/http"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/gorilla/websocket"
)

type Handler struct {
	hub *Hub
}

func NewHandler(h *Hub) *Handler {
	return &Handler{
		hub: h,
	}
}

type CreateRoomReq struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

func (h *Handler) CreateRoom(c *gin.Context) {
	var req CreateRoomReq
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}

	h.hub.Rooms[req.Id] = &Room{
		Id:      req.Id,
		Name:    req.Name,
		Clients: make(map[string]*Client),
	}

	c.JSON(http.StatusOK, req)
}

var upgrader = websocket.Upgrader{
	ReadBufferSize:  1024,
	WriteBufferSize: 1024,
	CheckOrigin: func(r *http.Request) bool {
		// origin := r.Header.Get("Origin")
		// if origin == "http://localhost:3000" || origin == "http://127.0.0.1:3000" {
		// 	return true
		// }
		return true
	},
}

func (h *Handler) JoinRoom(c *gin.Context) {

	conn, err := upgrader.Upgrade(c.Writer, c.Request, nil)
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": err.Error()})
		return
	}
	//ws/JoinRoom?roomId=1&userId=1&username=John
	roomId := c.Param("roomId")
	clientId := c.Query("userId")
	username := c.Query("username")

	client := &Client{
		Conn:     conn,
		Message:  make(chan *Message, 10),
		Id:       clientId,
		RoomId:   roomId,
		Username: username,
	}

	msg := &Message{
		Content:   "A new user has joined the room",
		RoomId:    roomId,
		Username:  username,
		CreatedAt: time.Now().String(),
	}

	//Register a new client through the register channel
	h.hub.Register <- client
	//Broadcast that message to all clients
	h.hub.Broadcast <- msg

	go client.writeMessage()
	client.readMessage(h.hub)
}

type RoomRes struct {
	Id   string `json:"id"`
	Name string `json:"name"`
}

func (h *Handler) GetRooms(c *gin.Context) {
	rooms := make([]RoomRes, 0)

	for _, room := range h.hub.Rooms {
		rooms = append(rooms, RoomRes{
			Id:   room.Id,
			Name: room.Name,
		})
	}

	c.JSON(http.StatusOK, rooms)
}

type ClientRes struct {
	Id       string `json:"id"`
	UserName string `json:"userName"`
}

func (h *Handler) GetClients(c *gin.Context) {
	var clients []ClientRes
	roomId := c.Param("roomId")

	if _, ok := h.hub.Rooms[roomId]; !ok {
		clients = make([]ClientRes, 0)
		c.JSON(http.StatusNotFound, clients)
		return
	}

	for _, client := range h.hub.Rooms[roomId].Clients {
		clients = append(clients, ClientRes{
			Id:       client.Id,
			UserName: client.Username,
		})
	}

	c.JSON(http.StatusOK, clients)
}
