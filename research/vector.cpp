// constructing vectors
#include <iostream>
#include <vector>

int main ()
{
	int array[3] = {0, 1, 2};
  std::vector<int> fifth = {1, 2, 3, 4};
  fifth = array;

  std::cout << "The contents of fifth are:";
  for (std::vector<int>::iterator it = fifth.begin(); it != fifth.end(); ++it)
    std::cout << ' ' << *it;
  std::cout << '\n';

  return 0;
}
