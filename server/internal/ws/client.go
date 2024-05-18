package ws

// import "golang.org/x/net/websocket"
import (
	"log"
	"time"

	"github.com/gorilla/websocket"
)

type Client struct {
	Conn     *websocket.Conn
	Message  chan *Message
	Id       string `json: "id"`
	RoomId   string `json: "roomId"`
	Username string `json: "username"`
}

type Message struct {
	Content   string `json:"content"`
	RoomId    string `json:"roomId"`
	Username  string `json:"username"`
	CreatedAt string `json:"createdAt"`
}

func (c *Client) writeMessage() {
	defer func() {
		c.Conn.Close()
	}()

	for {
		message, ok := <-c.Message
		if !ok {
			return
		}

		c.Conn.WriteJSON(message)
	}
}

func (c *Client) readMessage(hub *Hub) {
	defer func() {
		hub.Unregister <- c
		c.Conn.Close()
	}()

	for {
		_, message, err := c.Conn.ReadMessage()
		if err != nil {
			if websocket.IsUnexpectedCloseError(err, websocket.CloseGoingAway, websocket.CloseAbnormalClosure) {
				log.Printf("error: %v", err)
			}
			break
		}

		msg := &Message{
			Content:   string(message),
			RoomId:    c.RoomId,
			Username:  c.Username,
			CreatedAt: time.Now().String(),
		}

		hub.Broadcast <- msg
	}
}
