package main

import (
	"bufio"
	"fmt"
	"io"
	"os/exec"
	"runtime/debug"

	"github.com/kr/pretty"
)

func forever(fn func()) {
	f := func() {
		defer func() {
			if r := recover(); r != nil {
				debug.PrintStack()
				pretty.Println("Recover from error:", r)
			}
		}()
		fn()
	}
	for {
		f()
	}
}
func execCommand(commandName string, params []string) bool {
	cmd := exec.Command(commandName, params...)
	stdout, err := cmd.StdoutPipe()
	if err != nil {
		fmt.Println(err)
		return false
	}
	cmd.Start()
	//read even line
	reader := bufio.NewReader(stdout)
	for {
		line, err2 := reader.ReadString('\n')
		if err2 != nil || io.EOF == err2 {
			break
		}
		if 0 == len(line) || line == "\n" {
			continue
		}
		fmt.Print(line)
	}

	cmd.Wait()
	return true
}

func main() {
	execCommand("fping", []string{"1.1.1.1"})
}
