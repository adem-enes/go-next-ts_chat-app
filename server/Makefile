build: 
	@go build -o bin/main cmd/main.go
run: build
	@./bin/main
runmain:
	@go run cmd/main.go


initdb:
	@go run db/storage/main.go
buildinitdb:
	@go build -o ./bin/initdb db/storage/main.go
runinitdb: buildinitdb
	@./bin/initdb


#Below commands are provided for an example use. You can arrange as you want. (Don't forget to match with the env file)
postgresinit: 
	docker run --name postgres15 -p 5433:5432 -e POSTGRES_USER=root -e POSTGRES_PASSWORD=password -d postgres
postgres15:
	docker exec -it postgres15 psql
createdb:
	docker exec -it postgres15 createdb --username=root --owner=root chat_app
dropdb:
	docker exec -it postgres15 dropdb chat-app

.PHONY: postgresinit postgres createdb dropdb
#end of example
